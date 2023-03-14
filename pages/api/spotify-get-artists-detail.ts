import spotifyApi from "@/lib/SpotifyClient";
import type { NextApiRequest, NextApiResponse } from "next";
import setSpotifyAccessToken from "@/lib/setSpotifyAccessToken";

export default async function SpotifyGetArtistsDetails(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return await setSpotifyAccessToken(req, res, spotifyApi, async () => {
    if (!req.query.artists) {
      return res.status(400).json({ error: "Missing artists query parameter" });
    }
    const data = await spotifyApi.getArtists(
      Array.isArray(req.query.artists) ? req.query.artists : [req.query.artists]
    );
    return res.status(200).json(data?.body.artists || {});
  });
}
