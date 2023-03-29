"use client";
import useUnsplashImage from "@/utils/useUnsplashImage";
import { AspectRatio, Box, Flex, Heading, Text } from "@chakra-ui/react";
import { useContext } from "react";
import LazyImage from "./LazyImage";
import { SpotifyAutocompleteContext } from "./SpotifyAutocomplete";
import { SpotifyRecommendationsContext } from "./SpotifyRecommendationsProvider";

interface ISpotifyCollectionCard {
  name?: string;
  unSplashId?: string;
  artists?: string[];
  isBlank?: boolean;
}

export function SpotifyCollectionCard({
  name,
  unSplashId,
  artists,
  isBlank,
}: ISpotifyCollectionCard) {
  const imgUrl = useUnsplashImage(unSplashId);
  const { addArtists, fetchRecs } =
    useContext(SpotifyRecommendationsContext) || {};

  const { setIsNew } = useContext(SpotifyAutocompleteContext);

  const onSelectCollection = () => {
    artists && addArtists?.(artists);
    fetchRecs && setTimeout(fetchRecs, 0);
  };

  const blankContent = (
    <Flex
      role="button"
      onClick={() => setIsNew(true)}
      justifyContent="center"
      alignItems="center"
      height="100%"
      bg="blackAlpha.500"
      color="whiteAlpha.600"
      _hover={{ bg: "blackAlpha.700", color: "whiteAlpha.800" }}
      borderRadius="lg"
      border="2px dashed"
      borderColor="whiteAlpha.300"
      userSelect="none"
    >
      <Box>
        <Heading size="lg">Create</Heading>
      </Box>
    </Flex>
  );

  const content = (
    <>
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
    </>
  );

  return (
    <Box
      role="button"
      cursor="pointer"
      onClick={onSelectCollection}
      borderRadius="md"
      h="100%"
      sx={{
        "&:hover .spotify-collection-card-details": {
          bg: "blackAlpha.900",
        },
      }}
    >
      {isBlank ? blankContent : content}
    </Box>
  );
}
