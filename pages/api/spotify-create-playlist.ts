import spotifyApi from "@/lib/SpotifyClient";
import type { NextApiRequest, NextApiResponse } from "next";
import setSpotifyAccessToken from "@/lib/setSpotifyAccessToken";

export default async function SpotifyGetGenreSeeds(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return await setSpotifyAccessToken(req, res, spotifyApi, async () => {
    const data = await spotifyApi.createPlaylist(req.body.name as string);
    return res.status(200).json({ success: true, data });
  });
}
