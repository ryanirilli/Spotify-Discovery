"use client";
import useUnsplashImage from "@/utils/useUnsplashImage";
import { AspectRatio, Box, Heading } from "@chakra-ui/react";
import { useContext } from "react";
import LazyImage from "./LazyImage";
import { SpotifyRecommendationsContext } from "./SpotifyRecommendationsProvider";

interface ISpotifyCollectionCard {
  name: string;
  unSplashId?: string;
  artists?: string[];
}

export default function SpotifyCollectionCard({
  name,
  unSplashId,
  artists,
}: ISpotifyCollectionCard) {
  const imgUrl = useUnsplashImage(unSplashId);
  const { addArtists, fetchRecs } =
    useContext(SpotifyRecommendationsContext) || {};

  const onSelectCollection = () => {
    artists && addArtists?.(artists);
    fetchRecs && setTimeout(fetchRecs, 0);
  };

  return (
    <Box
      role="button"
      cursor="pointer"
      onClick={onSelectCollection}
      border="1px"
      borderRadius="md"
      borderColor="whiteAlpha.400"
      _hover={{ borderColor: "whiteAlpha.600" }}
    >
      <AspectRatio borderTopRadius="md" mb={1} ratio={1} overflow="hidden">
        <LazyImage src={imgUrl} alt={""} />
      </AspectRatio>
      <Box p={2}>
        <Heading
          ml={1}
          as="h4"
          color="whiteAlpha.700"
          size="md"
          textTransform="capitalize"
        >
          {name}
        </Heading>
      </Box>
    </Box>
  );
}
