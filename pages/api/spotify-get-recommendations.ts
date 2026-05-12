import type { NextApiRequest, NextApiResponse } from "next";
import { spotifyClientCredentialsFetch } from "@/lib/SpotifyClientCredentials";
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
    const settings: {
      limit: number;
      seed_artists: string[];
      seed_genres: string[];
    } & Partial<Record<(typeof FILTER_PARAM_KEYS)[number], number>> = {
      limit: 100,
      seed_artists: seed_artists.split(",").filter((a) => a !== ""),
      seed_genres: seed_genres.split(",").filter((a) => a !== ""),
      ...recommendationFilters,
    };

    const params = new URLSearchParams();
    params.set("limit", settings.limit.toString());
    if (settings.seed_artists.length) {
      params.set("seed_artists", settings.seed_artists.join(","));
    }
    if (settings.seed_genres.length) {
      params.set("seed_genres", settings.seed_genres.join(","));
    }
    FILTER_PARAM_KEYS.forEach((key) => {
      const value = settings[key];
      if (value !== undefined) params.set(key, value.toString());
    });

    const response = await spotifyClientCredentialsFetch(
      `/v1/recommendations?${params.toString()}`
    );
    const data = await response.json();

    if (!response.ok) {
      console.error(
        JSON.stringify({
          event: "spotify_recommendations_upstream_error",
          path: req.url?.split("?")[0],
          queryKeys: Object.keys(req.query).sort(),
          spotifyStatusCode: response.status,
          spotifyError: data?.error,
          timestamp: new Date().toISOString(),
        })
      );
      return res.status(502).json({ error: "Spotify recommendations failed" });
    }

    const tracks: unknown =
      data?.tracks?.filter((t: SpotifyApi.TrackObjectFull) =>
        Boolean(t.preview_url)
      ) || [];

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
