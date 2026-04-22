import spotifyApi from "@/lib/SpotifyClient";
import type { NextApiRequest, NextApiResponse } from "next";
import setSpotifyAccessToken from "@/lib/setSpotifyAccessToken";

export default async function SpotifyGetTrack(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return await setSpotifyAccessToken(req, res, spotifyApi, async () => {
    const data = await spotifyApi.getTrack(req.query.id as string);
    return res.status(200).json(data?.body || {});
  });
}
