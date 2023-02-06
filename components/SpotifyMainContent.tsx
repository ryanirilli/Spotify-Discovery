"use client";
import { Box, Center } from "@chakra-ui/react";
import { useContext } from "react";
import {
  SpotifyRecommendationsContext,
  TSpotifyRecommendationsContext,
} from "./SpotifyRecommendationsProvider";
import SpotifyTracks from "./SpotifyTracks";
import Lottie from "@/components/Lottie";
import animationData from "@/public/dj.json";

export default function SpotifyMainContent() {
  const { recommendations } = useContext(
    SpotifyRecommendationsContext
  ) as TSpotifyRecommendationsContext;

  return recommendations.length > 0 ? (
    <SpotifyTracks />
  ) : (
    <Center>
      <Box mt={[32, 16]} maxW={800} mixBlendMode="overlay">
        <Lottie lottiePlayerOptions={{ animationData }} />
      </Box>
    </Center>
  );
}
