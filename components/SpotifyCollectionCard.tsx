"use client";
import useUnsplashImage from "@/utils/useUnsplashImage";
import { AspectRatio, Box, Heading } from "@chakra-ui/react";
import LazyImage from "./LazyImage";

interface ISpotifyCollectionCard {
  name: string;
  unSplashId?: string;
}

export default function SpotifyCollectionCard({
  name,
  unSplashId,
}: ISpotifyCollectionCard) {
  const imgUrl = useUnsplashImage(unSplashId || "WFxIFrDnm-Q");

  return (
    <Box>
      <AspectRatio borderRadius="md" mb={1} ratio={1} overflow="hidden">
        <LazyImage src={imgUrl} alt={""} />
      </AspectRatio>
      <Heading ml={1} as="h4" size="md" textTransform="capitalize">
        {name}
      </Heading>
    </Box>
  );
}
