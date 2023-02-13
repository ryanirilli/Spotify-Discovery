"use client";
import { Center, Image } from "@chakra-ui/react";
import { useContext } from "react";
import {
  SpotifyRecommendationsContext,
  TSpotifyRecommendationsContext,
} from "./SpotifyRecommendationsProvider";
import SpotifyTracks from "./SpotifyTracks";
import SpotifyRecommendationFilters from "./SpotifyRecommendationFilters";

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
        <Center position="absolute" w="100%" h="100%">
          <Image
            maxW={["200px", "400px"]}
            role="presentation"
            src="/SVG/disco-stu-monochrome.svg"
            alt="Disco Stu monochromatic"
          />
        </Center>
      )}
    </>
  );
}
