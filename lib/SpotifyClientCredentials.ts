import SpotifyWebApi from "spotify-web-api-node";

type ClientCredentialsToken = {
  accessToken: string;
  expiresAt: number;
};

let cachedToken: ClientCredentialsToken | null = null;

async function fetchClientCredentialsToken() {
  const clientId = process.env.NEXT_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.NEXT_SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Spotify client credentials are not configured");
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString(
        "base64"
      )}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  const data = (await response.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
    expires_in?: number;
  };

  if (!response.ok || !data.access_token || !data.expires_in) {
    throw new Error(
      data.error_description || data.error || "Spotify client token failed"
    );
  }

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.accessToken;
}

async function getClientCredentialsToken() {
  if (cachedToken && cachedToken.expiresAt - Date.now() > 60_000) {
    return cachedToken.accessToken;
  }

  return fetchClientCredentialsToken();
}

export default async function createSpotifyClientCredentialsApi() {
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.NEXT_SPOTIFY_CLIENT_ID,
    clientSecret: process.env.NEXT_SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.NEXT_SPOTIFY_REDIRECT_URI,
  });
  spotifyApi.setAccessToken(await getClientCredentialsToken());
  return spotifyApi;
}
