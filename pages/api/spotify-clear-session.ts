import spotifyApi from "@/lib/SpotifyClient";
import type { NextApiRequest, NextApiResponse } from "next";
import setSpotifyAccessToken from "@/lib/setSpotifyAccessToken";
import cookie, { CookieSerializeOptions } from "cookie";

export default async function SpotifyClearSession(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return await setSpotifyAccessToken(req, res, spotifyApi, async () => {
    const cookieOptions: CookieSerializeOptions = {
      expires: new Date(0),
      httpOnly: true,
      sameSite: "lax" as "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    };

    // Clear the "spotify_access_token" and "spotify_refresh_token" cookies
    res.setHeader("Set-Cookie", [
      cookie.serialize("spotify_access_token", "", cookieOptions),
      cookie.serialize("spotify_refresh_token", "", cookieOptions),
    ]);
    return res.status(200).json({ success: true });
  });
}
