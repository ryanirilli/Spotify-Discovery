import spotifyApi from "@/lib/SpotifyClient";
import type { NextApiRequest, NextApiResponse } from "next";
import setSpotifyAccessToken from "@/lib/setSpotifyAccessToken";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  return await setSpotifyAccessToken(req, res, spotifyApi, async () => {
    const data = await spotifyApi.getAvailableGenreSeeds();
    const genres = data?.body?.genres || [];
    return res.status(200).json(genres);
  });
};
