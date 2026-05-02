"use client";

import { useContext, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  SpotifyRecommendationsContext,
  TSpotifyRecommendationsContext,
} from "./SpotifyRecommendationsProvider";
import {
  buildSearchStringFromConfig,
  parseSearchConfigFromParams,
} from "@/utils/spotifySearchConfig";

export default function SpotifySearchSync() {
  const router = useRouter();
  const pathname = usePathname() ?? "/search";
  const searchParams = useSearchParams();
  const {
    artists,
    genres,
    filters,
    setSearchConfig,
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
    const urlConfig = parseSearchConfigFromParams(params);
    const t = params.get("target_tempo");
    const m = params.get("max_tempo");

    const hasUrlState =
      urlConfig.artists.length > 0 ||
      urlConfig.genres.length > 0 ||
      t !== null ||
      m !== null;
    const hasProviderState =
      artists.length > 0 || genres.length > 0 || Object.keys(filters).length > 0;

    if (hasUrlState) {
      setSearchConfig(urlConfig);
      setTimeout(fetchRecs, 0);
    } else if (hasProviderState) {
      const qs = buildSearchStringFromConfig({ artists, genres, filters });
      router.replace(qs ? `${pathname}?${qs}` : pathname);
      setTimeout(fetchRecs, 0);
    }
  }, [
    artists,
    fetchRecs,
    filters,
    genres,
    pathname,
    router,
    searchParams,
    setSearchConfig,
  ]);

  // Mirror provider state back into the URL as the user adds/removes seeds
  // or changes filters. Only runs after initial hydration.
  useEffect(() => {
    if (!hydratedRef.current) return;
    const qs = buildSearchStringFromConfig({ artists, genres, filters });
    const current = searchParams?.toString() ?? "";
    if (qs === current) return;
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [artists, genres, filters, pathname, router, searchParams]);

  // When the user clears every seed, drop them back on /home — /search has
  // nothing meaningful to show without at least one artist or genre.
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (pathname !== "/search") return;
    if (artists.length === 0 && genres.length === 0) {
      router.replace("/home");
    }
  }, [artists.length, genres.length, pathname, router]);

  return null;
}
