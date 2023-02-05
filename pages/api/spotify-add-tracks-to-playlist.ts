import spotifyApi from "@/lib/SpotifyClient";
import type { NextApiRequest, NextApiResponse } from "next";
import setSpotifyAccessToken from "@/lib/setSpotifyAccessToken";

export default async function SpotifyAddTracksToPlaylist(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return await setSpotifyAccessToken(req, res, spotifyApi, async () => {
    const { playlistId, tracks } = req.body;
    const data = await spotifyApi.addTracksToPlaylist(playlistId, tracks);
    return res.status(200).json(data?.body || {});
  });
}
