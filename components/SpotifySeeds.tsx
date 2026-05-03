"use client";

import { useContext } from "react";
import { Avatar, Box, Button, Icon, Tag, Flex } from "@chakra-ui/react";
import { MdClose, MdLibraryMusic } from "react-icons/md";
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
    setSearchConfig,
    filters,
  } = useContext(
    SpotifyRecommendationsContext
  ) as TSpotifyRecommendationsContext;

  const hasSeeds = artists.length > 0 || genres.length > 0;

  // Render in insertion order so disabled (oldest) chips appear first.
  const orderedArtistDetails = artists
    .map((id) => artistsDetails.find((a) => a.id === id))
    .filter((a): a is (typeof artistsDetails)[number] => Boolean(a));

  return (
    <>
      {hasSeeds && (
        <Flex
          mt={[1, 2]}
          px={[2, 2]}
          py={[1.5, 2]}
          bg="blackAlpha.500"
          alignItems="center"
          gap={2}
          overflowX="auto"
          w="100%"
          css={{
            ...topNavScrollBarStyle,
            WebkitOverflowScrolling: "touch",
            overflowScrolling: "touch",
          }}
        >
          <Button
            h={["44px", "40px"]}
            minW="max-content"
            px={4}
            borderRadius="full"
            color="white"
            bg="whiteAlpha.200"
            flexShrink={0}
            _hover={{ bg: "whiteAlpha.300" }}
            _active={{ bg: "whiteAlpha.400" }}
            onClick={() => {
              window.scroll(0, 0);
              setSearchConfig({ artists: [], genres: [], filters });
            }}
          >
            <Icon as={MdClose} boxSize={5} />
            Clear all
          </Button>
          {orderedArtistDetails.map((artist) => {
            const artistImg = artist.images[artist.images.length - 1]?.url;
            const disabled = isArtistDisabled(artist.id);
            return (
              <Box
                key={artist.id}
                flexShrink={0}
                opacity={disabled ? 0.4 : 1}
                transition="opacity 0.15s ease"
                title={
                  disabled
                    ? "Disabled — remove a newer artist to re-enable"
                    : undefined
                }
              >
                <Tag.Root
                  size="lg"
                  borderRadius="full"
                  variant="solid"
                  pl={0}
                  minH={["44px", "40px"]}
                  maxW="none"
                  flexShrink={0}
                  whiteSpace="nowrap"
                >
                  <Tag.StartElement
                    boxSize={["32px", "28px"]}
                    overflow="hidden"
                    borderRadius="full"
                    mr={2}
                  >
                    <Avatar.Root boxSize="100%">
                      <Avatar.Image src={artistImg} />
                      <Avatar.Fallback name={artist.name} />
                    </Avatar.Root>
                  </Tag.StartElement>
                  <Tag.Label
                    maxW="none"
                    overflow="visible"
                    whiteSpace="nowrap"
                    lineClamp="none"
                  >
                    {artist.name}
                  </Tag.Label>
                  <Tag.EndElement boxSize={["32px", "28px"]} ml={1} mr={-1}>
                    <Tag.CloseTrigger
                      aria-label={`Remove ${artist.name}`}
                      boxSize="100%"
                      css={{ "& svg": { width: "20px", height: "20px" } }}
                      onClick={() => {
                        removeArtist(artist.id);
                        setTimeout(fetchRecs, 0);
                      }}
                    />
                  </Tag.EndElement>
                </Tag.Root>
              </Box>
            );
          })}
          {genres.map((genre) => (
            <Box key={genre} flexShrink={0}>
              <Tag.Root
                size="lg"
                borderRadius="full"
                variant="solid"
                minH={["44px", "40px"]}
                maxW="none"
                flexShrink={0}
                whiteSpace="nowrap"
              >
                <Tag.StartElement>
                  <Icon ml={-1} mr={2} as={MdLibraryMusic} color="white" />
                </Tag.StartElement>
                <Tag.Label
                  textTransform="capitalize"
                  maxW="none"
                  overflow="visible"
                  whiteSpace="nowrap"
                  lineClamp="none"
                >
                  {genre}
                </Tag.Label>
                <Tag.EndElement boxSize={["32px", "28px"]} ml={1} mr={-1}>
                  <Tag.CloseTrigger
                    aria-label={`Remove ${genre}`}
                    boxSize="100%"
                    css={{ "& svg": { width: "20px", height: "20px" } }}
                    onClick={() => {
                      removeGenre(genre);
                      setTimeout(fetchRecs, 0);
                    }}
                  />
                </Tag.EndElement>
              </Tag.Root>
            </Box>
          ))}
        </Flex>
      )}
    </>
  );
}
