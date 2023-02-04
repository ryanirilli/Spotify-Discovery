import spotifyApi from "@/lib/SpotifyClient";
import type { NextApiRequest, NextApiResponse } from "next";
import setSpotifyAccessToken from "@/lib/setSpotifyAccessToken";
import { TSpotifyTrack } from "@/types/SpotifyTrack";

export default async function SpotifyGetRecommendationsreq(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return await setSpotifyAccessToken(req, res, spotifyApi, async () => {
    const seed_artists = (req.query.artists as string) ?? "";
    const seed_genres = (req.query.genres as string) ?? "";
    const settings = {
      limit: 100,
      seed_artists: seed_artists.split(",").filter((a) => a !== ""),
      seed_genres: seed_genres.split(",").filter((a) => a !== ""),
    };
    const data = await spotifyApi.getRecommendations(settings);
    const tracks: unknown =
      data?.body?.tracks.filter((t) => Boolean(t.preview_url)) || [];

    return res.status(200).json(tracks as TSpotifyTrack[]);
  });
}
