"use client";

import { useContext, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  SpotifyRecommendationsContext,
  TSpotifyRecommendationsContext,
  TSpotifyRecommendationFilters,
} from "./SpotifyRecommendationsProvider";

function buildSearchString(
  artists: string[],
  genres: string[],
  filters: TSpotifyRecommendationFilters
) {
  const params = new URLSearchParams();
  if (artists.length) params.set("artists", artists.join(","));
  if (genres.length) params.set("genres", genres.join(","));
  if (filters.target_tempo)
    params.set("target_tempo", String(filters.target_tempo));
  if (filters.max_tempo) params.set("max_tempo", String(filters.max_tempo));
  return params.toString();
}

function parseCsv(value: string | null) {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function SpotifySearchSync() {
  const router = useRouter();
  const pathname = usePathname() ?? "/search";
  const searchParams = useSearchParams();
  const {
    artists,
    setArtists,
    genres,
    addGenre,
    removeGenre,
    filters,
    setFilters,
    fetchRecs,
  } = useContext(SpotifyRecommendationsContext) as TSpotifyRecommendationsContext;

  const hydratedRef = useRef(false);

  // Hydrate from URL on first mount. If URL has no params but provider has
  // state (e.g. navigating from /home after seeding), push provider state
  // into the URL instead. Then fetch recommendations.
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    const params = searchParams ?? new URLSearchParams();
    const urlArtists = parseCsv(params.get("artists"));
    const urlGenres = parseCsv(params.get("genres"));
    const urlFilters: TSpotifyRecommendationFilters = {};
    const t = params.get("target_tempo");
    const m = params.get("max_tempo");
    if (t) urlFilters.target_tempo = Number(t);
    if (m) urlFilters.max_tempo = Number(m);

    const hasUrlState =
      urlArtists.length > 0 || urlGenres.length > 0 || t !== null || m !== null;
    const hasProviderState =
      artists.length > 0 || genres.length > 0 || Object.keys(filters).length > 0;

    if (hasUrlState) {
      setArtists(urlArtists);

      genres.forEach((g) => {
        if (!urlGenres.includes(g)) removeGenre(g);
      });
      urlGenres.forEach((g) => {
        if (!genres.includes(g)) addGenre(g);
      });

      setFilters(urlFilters);
      setTimeout(fetchRecs, 0);
    } else if (hasProviderState) {
      const qs = buildSearchString(artists, genres, filters);
      router.replace(qs ? `${pathname}?${qs}` : pathname);
      setTimeout(fetchRecs, 0);
    }
  }, [
    addGenre,
    artists,
    fetchRecs,
    filters,
    genres,
    pathname,
    removeGenre,
    router,
    searchParams,
    setArtists,
    setFilters,
  ]);

  // Mirror provider state back into the URL as the user adds/removes seeds
  // or changes filters. Only runs after initial hydration.
  useEffect(() => {
    if (!hydratedRef.current) return;
    const qs = buildSearchString(artists, genres, filters);
    const current = searchParams?.toString() ?? "";
    if (qs === current) return;
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [artists, genres, filters, pathname, router, searchParams]);

  return null;
}
