"use client";
import { useContext } from "react";
import {
  SpotifyRecommendationsContext,
  TSpotifyRecommendationsContext,
} from "./SpotifyRecommendationsProvider";
import SpotifyTracks from "./SpotifyTracks";
import SpotifyRecommendationFilters from "./SpotifyRecommendationFilters";
import SpotifyDefaultContent from "./SpotifyDefaultContent";

export default function SpotifyMainContent() {
  const { recommendations, isLoadingRecs } = useContext(
    SpotifyRecommendationsContext
  ) as TSpotifyRecommendationsContext;

  const { artists } = useContext(SpotifyRecommendationsContext) || {};
  const hasArtists = Boolean(artists?.length);
  const hasContent =
    hasArtists && (recommendations.length > 0 || isLoadingRecs);

  return (
    <>
      {hasContent ? (
        <>
          <SpotifyRecommendationFilters />
          <SpotifyTracks />
        </>
      ) : (
        <SpotifyDefaultContent />
      )}
    </>
  );
}
