import type { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";
import querystring from "querystring";
import SpotifyWebApi from "spotify-web-api-node";

type SpotifyApiError = {
  body?: {
    error?: string | { status?: number; message?: string };
  };
  headers?: Record<string, string | string[] | undefined>;
  message?: string;
  name?: string;
  statusCode?: number;
};

type SpotifyTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
  expires_in?: number;
};

type SpotifyErrorPhase =
  | "access_token_refresh"
  | "spotify_route_handler"
  | "spotify_route_handler_after_token_refresh";

const TRANSIENT_RETRY_DELAYS_MS = [250, 750] as const;

function getRequestId(req: NextApiRequest) {
  const vercelId = req.headers["x-vercel-id"];
  if (typeof vercelId === "string" && vercelId) return vercelId;
  return `spotify-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getSpotifyStatusCode(err: unknown) {
  const spotifyErr = err as SpotifyApiError;
  if (typeof spotifyErr.statusCode === "number") return spotifyErr.statusCode;
  const bodyError = spotifyErr.body?.error;
  if (typeof bodyError === "object" && typeof bodyError.status === "number") {
    return bodyError.status;
  }
  return undefined;
}

function getSpotifyErrorMessage(err: unknown) {
  const spotifyErr = err as SpotifyApiError;
  const bodyError = spotifyErr.body?.error;
  if (typeof bodyError === "string") return bodyError;
  if (typeof bodyError?.message === "string") return bodyError.message;
  if (typeof spotifyErr.message === "string") return spotifyErr.message;
  return "Unknown Spotify API error";
}

function getHeaderValue(
  headers: SpotifyApiError["headers"],
  headerName: string
) {
  if (!headers) return undefined;
  const value =
    headers[headerName] || headers[headerName.toLowerCase()] || undefined;
  return Array.isArray(value) ? value.join(",") : value;
}

function getPublicStatusCode(spotifyStatusCode: number | undefined) {
  if (!spotifyStatusCode) return 502;
  if (spotifyStatusCode === 401 || spotifyStatusCode === 403) {
    return spotifyStatusCode;
  }
  if (spotifyStatusCode === 429) return 429;
  if (spotifyStatusCode >= 500) return 502;
  if (spotifyStatusCode >= 400) return 400;
  return 502;
}

function isTransientSpotifyStatus(spotifyStatusCode: number | undefined) {
  return (
    spotifyStatusCode === 429 ||
    (typeof spotifyStatusCode === "number" && spotifyStatusCode >= 500)
  );
}

function getRetryDelayMs(err: unknown, fallbackDelayMs: number) {
  const retryAfter = getHeaderValue(
    (err as SpotifyApiError).headers,
    "retry-after"
  );
  const retryAfterSeconds = retryAfter ? Number(retryAfter) : NaN;
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0) {
    return Math.min(retryAfterSeconds * 1000, 2000);
  }
  return fallbackDelayMs;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function logSpotifyError({
  err,
  phase,
  req,
  requestId,
}: {
  err: unknown;
  phase: SpotifyErrorPhase;
  req: NextApiRequest;
  requestId: string;
}) {
  const spotifyErr = err as SpotifyApiError;
  const spotifyStatusCode = getSpotifyStatusCode(err);

  console.error(
    JSON.stringify({
      event: "spotify_api_error",
      requestId,
      phase,
      method: req.method,
      path: req.url?.split("?")[0],
      queryKeys: Object.keys(req.query).sort(),
      spotifyStatusCode,
      spotifyMessage: getSpotifyErrorMessage(err),
      errorName: spotifyErr.name,
      errorMessage: spotifyErr.message,
      retryAfter: getHeaderValue(spotifyErr.headers, "retry-after"),
      spotifyRequestId:
        getHeaderValue(spotifyErr.headers, "x-request-id") ||
        getHeaderValue(spotifyErr.headers, "x-spotify-request-id"),
      vercelRegion: process.env.VERCEL_REGION,
      vercelUrl: process.env.VERCEL_URL,
      timestamp: new Date().toISOString(),
    })
  );
}

function logSpotifyRetry({
  attempt,
  delayMs,
  err,
  phase,
  req,
  requestId,
}: {
  attempt: number;
  delayMs: number;
  err: unknown;
  phase: SpotifyErrorPhase;
  req: NextApiRequest;
  requestId: string;
}) {
  console.warn(
    JSON.stringify({
      event: "spotify_api_retry",
      requestId,
      phase,
      method: req.method,
      path: req.url?.split("?")[0],
      attempt,
      delayMs,
      spotifyStatusCode: getSpotifyStatusCode(err),
      spotifyMessage: getSpotifyErrorMessage(err),
      timestamp: new Date().toISOString(),
    })
  );
}

function logSpotifyAccessTokenRejected(req: NextApiRequest, requestId: string) {
  console.warn(
    JSON.stringify({
      event: "spotify_access_token_rejected",
      requestId,
      method: req.method,
      path: req.url?.split("?")[0],
      action: "refresh_and_retry",
      timestamp: new Date().toISOString(),
    })
  );
}

async function runSpotifyHandler<T>({
  fn,
  phase,
  req,
  requestId,
  spotifyApi,
}: {
  fn: (spotifyApi: SpotifyWebApi) => T | Promise<T>;
  phase: SpotifyErrorPhase;
  req: NextApiRequest;
  requestId: string;
  spotifyApi: SpotifyWebApi;
}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn(spotifyApi);
    } catch (err) {
      const canRetry =
        req.method === "GET" &&
        attempt < TRANSIENT_RETRY_DELAYS_MS.length &&
        isTransientSpotifyStatus(getSpotifyStatusCode(err));

      if (!canRetry) {
        throw err;
      }

      const delayMs = getRetryDelayMs(err, TRANSIENT_RETRY_DELAYS_MS[attempt]);
      logSpotifyRetry({
        attempt: attempt + 1,
        delayMs,
        err,
        phase,
        req,
        requestId,
      });
      await sleep(delayMs);
    }
  }
}

export default async function setSpotifyAccessToken<T>(
  req: NextApiRequest,
  res: NextApiResponse,
  _spotifyApi: SpotifyWebApi,
  fn: (spotifyApi: SpotifyWebApi) => T | Promise<T>
): Promise<T | void> {
  const requestId = getRequestId(req);
  const { spotify_access_token, spotify_refresh_token } = req.cookies;
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.NEXT_SPOTIFY_CLIENT_ID,
    clientSecret: process.env.NEXT_SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.NEXT_SPOTIFY_REDIRECT_URI,
  });

  if (!spotify_access_token && !spotify_refresh_token) {
    const error = "No access token or refresh token found";
    console.warn(
      JSON.stringify({
        event: "spotify_auth_missing",
        requestId,
        method: req.method,
        path: req.url?.split("?")[0],
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(401).json({ error, requestId });
  }

  let accessToken = spotify_access_token;

  if (accessToken) {
    spotifyApi.setAccessToken(accessToken);
  } else if (spotify_refresh_token) {
    const refreshed = await refreshSpotifyAccessToken(
      spotify_refresh_token,
      req,
      res,
      spotifyApi,
      requestId
    );
    if (!refreshed) return;
  } else {
    const error = "No refresh token found";
    console.warn(
      JSON.stringify({
        event: "spotify_refresh_token_missing",
        requestId,
        method: req.method,
        path: req.url?.split("?")[0],
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(401).json({ error, requestId });
  }

  try {
    return await runSpotifyHandler({
      fn,
      phase: "spotify_route_handler",
      req,
      requestId,
      spotifyApi,
    });
  } catch (err) {
    const spotifyStatusCode = getSpotifyStatusCode(err);

    if (
      spotifyStatusCode === 401 &&
      accessToken &&
      spotify_refresh_token &&
      !res.headersSent
    ) {
      logSpotifyAccessTokenRejected(req, requestId);
      const refreshed = await refreshSpotifyAccessToken(
        spotify_refresh_token,
        req,
        res,
        spotifyApi,
        requestId
      );

      if (!refreshed) return;

      try {
        return await runSpotifyHandler({
          fn,
          phase: "spotify_route_handler_after_token_refresh",
          req,
          requestId,
          spotifyApi,
        });
      } catch (retryErr) {
        const retrySpotifyStatusCode = getSpotifyStatusCode(retryErr);
        logSpotifyError({
          err: retryErr,
          phase: "spotify_route_handler_after_token_refresh",
          req,
          requestId,
        });

        const publicStatusCode = getPublicStatusCode(retrySpotifyStatusCode);
        return res.status(publicStatusCode).json({
          error: "Spotify API request failed",
          requestId,
          spotifyStatusCode: retrySpotifyStatusCode,
        });
      }
    }

    logSpotifyError({
      err,
      phase: "spotify_route_handler",
      req,
      requestId,
    });

    const publicStatusCode = getPublicStatusCode(spotifyStatusCode);
    return res.status(publicStatusCode).json({
      error: "Spotify API request failed",
      requestId,
      spotifyStatusCode,
    });
  }
}

async function refreshSpotifyAccessToken(
  refreshToken: string,
  req: NextApiRequest,
  res: NextApiResponse,
  spotifyApi: SpotifyWebApi,
  requestId: string
): Promise<boolean> {
  const client_id = process.env.NEXT_SPOTIFY_CLIENT_ID;
  const client_secret = process.env.NEXT_SPOTIFY_CLIENT_SECRET;
  const cred = `${client_id}:${client_secret}`;

  const authOptions = {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(cred).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: querystring.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  };

  try {
    const response = await fetch(
      "https://accounts.spotify.com/api/token",
      authOptions
    );

    const data = (await response.json()) as SpotifyTokenResponse;
    const { access_token, expires_in } = data;

    if (!response.ok || !access_token || !expires_in) {
      const error = new Error(
        data.error_description || data.error || "Spotify token refresh failed"
      ) as SpotifyApiError;
      error.statusCode = response.status;
      error.body = { error: data.error_description || data.error };
      throw error;
    }

    spotifyApi.setAccessToken(access_token);
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Set-Cookie", [
      cookie.serialize("spotify_access_token", access_token, {
        httpOnly: true,
        maxAge: expires_in,
        path: "/",
      }),
    ]);
    return true;
  } catch (err) {
    const error = "Could not refresh access token";
    logSpotifyError({
      err,
      phase: "access_token_refresh",
      req,
      requestId,
    });
    res.status(401).json({ error, requestId });
    return false;
  }
}
