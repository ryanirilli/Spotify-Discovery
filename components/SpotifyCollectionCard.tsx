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
      borderRadius="md"
      sx={{
        "&:hover .spotify-collection-card-details": {
          bg: "blackAlpha.900",
        },
      }}
    >
      <AspectRatio borderTopRadius="md" ratio={1} overflow="hidden">
        <LazyImage src={imgUrl} alt={""} />
      </AspectRatio>
      <Box
        className="spotify-collection-card-details"
        p={2}
        bg="blackAlpha.400"
        borderBottomRadius="md"
      >
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
