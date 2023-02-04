import type { NextApiRequest, NextApiResponse } from "next";
import querystring from "node:querystring";
import { nanoid } from "nanoid";
import cookie from "cookie";

var client_id = process.env.NEXT_SPOTIFY_CLIENT_ID;
var redirect_uri = process.env.NEXT_SPOTIFY_REDIRECT_URI;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  var state = nanoid();
  var scope = "user-read-private user-read-email playlist-read-private";

  res.setHeader("Set-Cookie", [
    cookie.serialize("spotify_login_state", state, {
      httpOnly: true,
      path: "/",
    }),
  ]);

  const qs = querystring.stringify({
    response_type: "code",
    client_id,
    scope,
    redirect_uri,
    state,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${qs}`);
}
