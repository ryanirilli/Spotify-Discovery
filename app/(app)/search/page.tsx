"use client";

import { Suspense } from "react";
import SpotifyRecommendationFilters from "@/components/SpotifyRecommendationFilters";
import SpotifyTracks from "@/components/SpotifyTracks";
import SpotifySearchSync from "@/components/SpotifySearchSync";

export default function SearchPage() {
  return (
    <>
      <Suspense fallback={null}>
        <SpotifySearchSync />
      </Suspense>
      <SpotifyRecommendationFilters />
      <SpotifyTracks />
    </>
  );
}
