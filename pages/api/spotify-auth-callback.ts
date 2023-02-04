// next.js api route for spotify auth callback
import { NextApiRequest, NextApiResponse } from "next";
import querystring from "querystring";
import cookie from "cookie";

type TTokenData = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
};

export default async function SpotifyAUthCallback(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code, state } = req.query;
  const redirect_uri = process.env.NEXT_SPOTIFY_REDIRECT_URI;
  const client_id = process.env.NEXT_SPOTIFY_CLIENT_ID;
  const client_secret = process.env.NEXT_SPOTIFY_CLIENT_SECRET;
  const cred = `${client_id}:${client_secret}`;

  const { spotify_login_state } = req.cookies;

  if (!state || state !== spotify_login_state) {
    res.redirect(`/`);
    return;
  }

  const authOptions = {
    method: "POST",
    body: querystring.stringify({
      code,
      redirect_uri,
      grant_type: "authorization_code",
    }),
    headers: {
      Authorization: `Basic ${Buffer.from(cred).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  const response = await fetch(
    "https://accounts.spotify.com/api/token",
    authOptions
  );

  const { access_token, refresh_token, expires_in } =
    (await response.json()) as TTokenData;

  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Set-Cookie", [
    cookie.serialize("spotify_access_token", access_token, {
      httpOnly: true,
      maxAge: expires_in,
      path: "/",
    }),
    cookie.serialize("spotify_refresh_token", refresh_token, {
      httpOnly: true,
      path: "/",
    }),
  ]);

  res.redirect(`/home`);
}
