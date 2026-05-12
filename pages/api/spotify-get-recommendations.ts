import type { NextApiRequest, NextApiResponse } from "next";
import createSpotifyClientCredentialsApi from "@/lib/SpotifyClientCredentials";
import { TSpotifyTrack } from "@/types/SpotifyTrack";

const FILTER_PARAM_KEYS = ["min_tempo", "max_tempo"] as const;

function getNumberQueryParam(
  query: NextApiRequest["query"],
  key: (typeof FILTER_PARAM_KEYS)[number]
) {
  const raw = query[key];
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default async function SpotifyGetRecommendationsreq(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const seed_artists = (req.query.artists as string) ?? "";
    const seed_genres = (req.query.genres as string) ?? "";
    const recommendationFilters = Object.fromEntries(
      FILTER_PARAM_KEYS.map((key) => [key, getNumberQueryParam(req.query, key)])
    );
    const settings = {
      limit: 100,
      seed_artists: seed_artists.split(",").filter((a) => a !== ""),
      seed_genres: seed_genres.split(",").filter((a) => a !== ""),
      ...recommendationFilters,
    };

    const spotifyApi = await createSpotifyClientCredentialsApi();
    const data = await spotifyApi.getRecommendations(settings);
    const tracks: unknown =
      data?.body?.tracks.filter((t) => Boolean(t.preview_url)) || [];

    return res.status(200).json(tracks as TSpotifyTrack[]);
  } catch (err) {
    console.error(
      JSON.stringify({
        event: "spotify_recommendations_error",
        path: req.url?.split("?")[0],
        queryKeys: Object.keys(req.query).sort(),
        errorMessage: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(502).json({ error: "Spotify recommendations failed" });
  }
}
