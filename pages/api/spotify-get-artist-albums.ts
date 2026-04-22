import spotifyApi from "@/lib/SpotifyClient";
import type { NextApiRequest, NextApiResponse } from "next";
import setSpotifyAccessToken from "@/lib/setSpotifyAccessToken";

export default async function SpotifyGetArtistAlbums(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return await setSpotifyAccessToken(req, res, spotifyApi, async () => {
    const data = await spotifyApi.getArtistAlbums(
      req.query.artistId as string,
      { include_groups: "album,single", limit: 50 }
    );
    return res.status(200).json(data?.body || {});
  });
}
