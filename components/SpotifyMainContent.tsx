"use client";
import { useContext } from "react";
import {
  SpotifyRecommendationsContext,
  TSpotifyRecommendationsContext,
} from "./SpotifyRecommendationsProvider";
import SpotifyTracks from "./SpotifyTracks";
import SpotifyRecommendationFilters from "./SpotifyRecommendationFilters";
import SpotifyHomePageContent from "./SpotifyHomePageContent";

export default function SpotifyMainContent() {
  const { recommendations, isLoadingRecs } = useContext(
    SpotifyRecommendationsContext
  ) as TSpotifyRecommendationsContext;

  const { artists } = useContext(SpotifyRecommendationsContext) || {};
  const hasArtists = Boolean(artists?.length);

  return (
    <>
      {hasArtists && (recommendations.length > 0 || isLoadingRecs) ? (
        <>
          <SpotifyRecommendationFilters />
          <SpotifyTracks />
        </>
      ) : (
        <SpotifyHomePageContent />
      )}
    </>
  );
}
