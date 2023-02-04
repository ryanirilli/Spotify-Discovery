import spotifyApi from "@/lib/SpotifyClient";
import type { NextApiRequest, NextApiResponse } from "next";
import setSpotifyAccessToken from "@/lib/setSpotifyAccessToken";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { artist } = req.query;
  return await setSpotifyAccessToken(req, res, spotifyApi, async () => {
    const data = await spotifyApi.searchArtists(artist as string);
    return res.status(200).json(data);
  });
};
