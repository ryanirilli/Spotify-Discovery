import type { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";
import querystring from "querystring";
import SpotifyWebApi from "spotify-web-api-node";

export default async function setSpotifyAccessToken(
  req: NextApiRequest,
  res: NextApiResponse,
  spotifyApi: SpotifyWebApi,
  fn: () => void
) {
  const { spotify_access_token, spotify_refresh_token } = req.cookies;

  if (!spotify_access_token && !spotify_refresh_token) {
    const error = "No access token or refresh token found";
    console.log(error);
    res.status(401).json({ error });
  }

  let accessToken = spotify_access_token;

  if (accessToken) {
    try {
      spotifyApi.setAccessToken(accessToken);
      return fn();
    } catch (err) {
      console.log("access token expired");
      if (spotify_refresh_token) {
        await refreshSpotifyAccessToken(spotify_refresh_token, res, spotifyApi);
        return fn();
      }
    }
  } else if (spotify_refresh_token) {
    await refreshSpotifyAccessToken(spotify_refresh_token, res, spotifyApi);
    return fn();
  } else {
    const error = "No refresh token found";
    console.log(error);
    return res.status(401).json({ error });
  }
}

async function refreshSpotifyAccessToken(
  refreshToken: string,
  res: NextApiResponse,
  spotifyApi: SpotifyWebApi
) {
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

    const { access_token, expires_in } = await response.json();
    spotifyApi.setAccessToken(access_token);
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Set-Cookie", [
      cookie.serialize("spotify_access_token", access_token, {
        httpOnly: true,
        maxAge: expires_in,
        path: "/",
      }),
    ]);
  } catch (err) {
    const error = "Could not refresh access token";
    console.log(error);
    return res.status(401).json({ error });
  }
}
