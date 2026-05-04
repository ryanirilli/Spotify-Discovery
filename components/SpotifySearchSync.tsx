"use client";

import { useContext, useEffect, useState } from "react";
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
    recommendations,
    isLoadingRecs,
  } = useContext(SpotifyRecommendationsContext) as TSpotifyRecommendationsContext;

  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from URL on first mount. If URL has no params but provider has
  // state (e.g. navigating from /home after seeding), push provider state
  // into the URL instead. Then fetch recommendations.
  useEffect(() => {
    if (isHydrated) return;

    const params = searchParams ?? new URLSearchParams();
    const urlConfig = parseSearchConfigFromParams(params);

    const hasUrlState =
      urlConfig.artists.length > 0 ||
      urlConfig.genres.length > 0 ||
      Object.keys(urlConfig.filters).length > 0;
    const hasProviderState =
      artists.length > 0 || genres.length > 0 || Object.keys(filters).length > 0;
    const providerConfig = { artists, genres, filters };
    const providerConfigKey = buildSearchStringFromConfig(providerConfig);
    const urlConfigKey = buildSearchStringFromConfig(urlConfig);
    const isSameConfig = providerConfigKey === urlConfigKey;
    const hasCurrentRecs = recommendations.length > 0 || isLoadingRecs;

    if (hasUrlState) {
      if (isSameConfig && hasCurrentRecs) {
        setIsHydrated(true);
        return;
      }
      if (!isSameConfig) {
        setSearchConfig(urlConfig);
      }
      setTimeout(fetchRecs, 0);
    } else if (hasProviderState) {
      const qs = providerConfigKey;
      router.replace(qs ? `${pathname}?${qs}` : pathname);
      if (!hasCurrentRecs) {
        setTimeout(fetchRecs, 0);
      }
    }

    setIsHydrated(true);
  }, [
    artists,
    fetchRecs,
    filters,
    genres,
    isHydrated,
    isLoadingRecs,
    pathname,
    recommendations.length,
    router,
    searchParams,
    setSearchConfig,
  ]);

  // Mirror provider state back into the URL as the user adds/removes seeds
  // or changes filters. Only runs after initial hydration.
  useEffect(() => {
    if (!isHydrated) return;
    if (pathname === "/search" && artists.length === 0 && genres.length === 0) {
      router.replace("/home");
      return;
    }

    const qs = buildSearchStringFromConfig({ artists, genres, filters });
    const current = searchParams?.toString() ?? "";
    if (qs === current) return;
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [artists, genres, filters, isHydrated, pathname, router, searchParams]);

  return null;
}
