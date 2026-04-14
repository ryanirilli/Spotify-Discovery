"use client";

import { useContext } from "react";
import {
  Avatar,
  Box,
  Icon,
  Tag,
  TagLabel,
  TagCloseButton,
  Flex,
} from "@chakra-ui/react";
import { MdLibraryMusic } from "react-icons/md";
import {
  SpotifyRecommendationsContext,
  TSpotifyRecommendationsContext,
} from "./SpotifyRecommendationsProvider";
import { topNavScrollBarStyle } from "@/utils/scrollBarStyle";

export default function SpotifySeeds() {
  const {
    artists,
    artistsDetails,
    removeArtist,
    fetchRecs,
    genres,
    removeGenre,
    isArtistDisabled,
  } = useContext(
    SpotifyRecommendationsContext
  ) as TSpotifyRecommendationsContext;

  const hasArtists = artistsDetails.length > 0;

  // Render in insertion order so disabled (oldest) chips appear first.
  const orderedArtistDetails = artists
    .map((id) => artistsDetails.find((a) => a.id === id))
    .filter((a): a is (typeof artistsDetails)[number] => Boolean(a));

  return (
    <>
      {hasArtists && (
        <Flex
          mt={[1, 2]}
          p={[1, 2]}
          pb={[0, 1]}
          bg="blackAlpha.500"
          overflowX="scroll"
          w="100%"
          ml={[1, 0]}
          sx={{
            ...topNavScrollBarStyle,
            WebkitOverflowScrolling: "touch",
            overflowScrolling: "touch",
          }}
        >
          {orderedArtistDetails.map((artist) => {
            const artistImg = artist.images[artist.images.length - 1]?.url;
            const disabled = isArtistDisabled(artist.id);
            return (
              <Box
                key={artist.id}
                mr={2}
                opacity={disabled ? 0.4 : 1}
                transition="opacity 0.15s ease"
                title={
                  disabled
                    ? "Disabled — remove a newer artist to re-enable"
                    : undefined
                }
              >
                <Tag
                  size="lg"
                  borderRadius="full"
                  variant="solid"
                  colorScheme="blue"
                >
                  <Avatar
                    src={artistImg}
                    size="xs"
                    name={artist.name}
                    ml={-2}
                    mr={2}
                  />
                  <TagLabel>{artist.name}</TagLabel>
                  <TagCloseButton
                    onClick={() => {
                      removeArtist(artist.id);
                      setTimeout(fetchRecs, 0);
                    }}
                  />
                </Tag>
              </Box>
            );
          })}
          {genres.map((genre) => (
            <Box key={genre} mr={2}>
              <Tag
                size="lg"
                borderRadius="full"
                variant="solid"
                colorScheme="blue"
              >
                <Icon ml={-1} mr={2} as={MdLibraryMusic} color="white" />
                <TagLabel textTransform="capitalize">{genre}</TagLabel>
                <TagCloseButton
                  onClick={() => {
                    removeGenre(genre);
                    setTimeout(fetchRecs, 0);
                  }}
                />
              </Tag>
            </Box>
          ))}
        </Flex>
      )}
    </>
  );
}
