"use client";

import { useContext, useEffect, useRef, useState } from "react";
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
  const didHydrateRef = useRef(false);
  const currentSearch = searchParams?.toString() ?? "";

  // Hydrate from URL on first mount. If URL has no params but provider has
  // state (e.g. navigating from /home after seeding), push provider state
  // into the URL instead. Then fetch recommendations.
  useEffect(() => {
    if (didHydrateRef.current) return;
    didHydrateRef.current = true;

    const params = new URLSearchParams(currentSearch);
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
      void fetchRecs(urlConfig);
    } else if (hasProviderState) {
      const qs = providerConfigKey;
      router.replace(qs ? `${pathname}?${qs}` : pathname);
      if (!hasCurrentRecs) {
        void fetchRecs(providerConfig);
      }
    }

    setIsHydrated(true);
  }, [
    artists,
    currentSearch,
    fetchRecs,
    filters,
    genres,
    isLoadingRecs,
    pathname,
    recommendations.length,
    router,
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
    if (qs === currentSearch) return;
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [artists, currentSearch, genres, filters, isHydrated, pathname, router]);

  return null;
}
