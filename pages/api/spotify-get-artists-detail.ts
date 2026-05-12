import type { NextApiRequest, NextApiResponse } from "next";
import { spotifyClientCredentialsFetch } from "@/lib/SpotifyClientCredentials";

function getArtistIds(queryArtists: NextApiRequest["query"]["artists"]) {
  const rawArtists = Array.isArray(queryArtists)
    ? queryArtists.join(",")
    : queryArtists;
  return (rawArtists || "")
    .split(",")
    .map((artist) => artist.trim())
    .filter(Boolean);
}

export default async function SpotifyGetArtistsDetails(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const artistIds = getArtistIds(req.query.artists);

  if (!artistIds.length) {
    return res.status(400).json({ error: "Missing artists query parameter" });
  }

  try {
    const params = new URLSearchParams({ ids: artistIds.join(",") });
    const response = await spotifyClientCredentialsFetch(
      `/v1/artists?${params.toString()}`
    );
    const data = await response.json();

    if (!response.ok) {
      console.error(
        JSON.stringify({
          event: "spotify_catalog_upstream_error",
          path: req.url?.split("?")[0],
          queryKeys: Object.keys(req.query).sort(),
          spotifyStatusCode: response.status,
          spotifyError: data?.error,
          timestamp: new Date().toISOString(),
        })
      );
      return res.status(502).json({ error: "Spotify catalog request failed" });
    }

    return res
      .status(200)
      .json(Array.isArray(data?.artists) ? data.artists : []);
  } catch (err) {
    console.error(
      JSON.stringify({
        event: "spotify_catalog_error",
        path: req.url?.split("?")[0],
        queryKeys: Object.keys(req.query).sort(),
        errorMessage: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
      })
    );
    return res.status(502).json({ error: "Spotify catalog request failed" });
  }
}
