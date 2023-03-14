"use client";
import { Center, Image } from "@chakra-ui/react";
import { useContext } from "react";
import {
  SpotifyRecommendationsContext,
  TSpotifyRecommendationsContext,
} from "./SpotifyRecommendationsProvider";
import SpotifyTracks from "./SpotifyTracks";
import SpotifyRecommendationFilters from "./SpotifyRecommendationFilters";
import SpotifyHomePageContent from "./SpotifyHomePageContent";

export default function SpotifyMainContent() {
  const { recommendations } = useContext(
    SpotifyRecommendationsContext
  ) as TSpotifyRecommendationsContext;

  return (
    <>
      <SpotifyRecommendationFilters />
      {recommendations.length > 0 ? (
        <SpotifyTracks />
      ) : (
        <SpotifyHomePageContent />
      )}
    </>
  );
}
