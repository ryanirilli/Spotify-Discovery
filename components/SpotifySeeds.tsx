"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Box, Icon, Tag, Flex } from "@chakra-ui/react";
import { Button } from "@/components/ui/Button";
import { MdClose, MdLibraryMusic } from "react-icons/md";
import {
  SpotifyRecommendationsContext,
  TSpotifyRecommendationsContext,
} from "./SpotifyRecommendationsProvider";
import SpotifyTopNavDiscoPattern from "./SpotifyTopNavDiscoPattern";
import { topNavScrollBarStyle } from "@/utils/scrollBarStyle";

export default function SpotifySeeds() {
  const router = useRouter();
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

  const syncAfterSeedRemoval = (
    nextArtists: string[],
    nextGenres: string[]
  ) => {
    if (nextArtists.length || nextGenres.length) {
      setTimeout(fetchRecs, 0);
      return;
    }

    router.replace("/home");
  };

  // Render in insertion order so disabled (oldest) chips appear first.
  const orderedArtistDetails = artists
    .map((id) => artistsDetails.find((a) => a.id === id))
    .filter((a): a is (typeof artistsDetails)[number] => Boolean(a));

  return (
    <>
      {hasSeeds && (
        <Box
          mt={[1, 2]}
          bg="blackAlpha.500"
          position="relative"
          w="100%"
          overflow="hidden"
        >
          <SpotifyTopNavDiscoPattern rows={5} />
          <Flex
            px={[2, 2]}
            py={[1.5, 2]}
            position="relative"
            zIndex={1}
            alignItems="center"
            gap={2}
            overflowX="auto"
            overflowY="hidden"
            w="100%"
            css={{
              ...topNavScrollBarStyle,
              WebkitOverflowScrolling: "touch",
              overflowScrolling: "touch",
            }}
          >
            <Button
              visual="secondary"
              size="sm"
              h={["44px", "40px"]}
              minW="max-content"
              px={4}
              flexShrink={0}
              onClick={() => {
                window.scrollTo({ top: 0 });
                setSearchConfig({ artists: [], genres: [], filters });
                router.replace("/home");
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
                      textStyle="controlLabel"
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
                          const nextArtists = artists.filter(
                            (id) => id !== artist.id
                          );
                          removeArtist(artist.id);
                          syncAfterSeedRemoval(nextArtists, genres);
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
                    textStyle="controlLabel"
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
                        const nextGenres = genres.filter((g) => g !== genre);
                        removeGenre(genre);
                        syncAfterSeedRemoval(artists, nextGenres);
                      }}
                    />
                  </Tag.EndElement>
                </Tag.Root>
              </Box>
            ))}
          </Flex>
        </Box>
      )}
    </>
  );
}
