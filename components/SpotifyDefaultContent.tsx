"use client";

import { useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Button, Flex, Heading, Text, Wrap } from "@chakra-ui/react";
import { SpotifyCollectionCard } from "./SpotifyCollectionCard";
import { SpotifyCollectionCardSkeleton } from "./SpotifyCollectionCardSkeleton";
import { SpotifyAutocompleteContext } from "./SpotifyAutocomplete";
import { spotifyCollectionsQuery } from "@/queries/spotifyCollections";
import spotifyUserInfo from "@/queries/spotifyUserInfo";

export default function SpotifyDefaultContent() {
  const { setIsNew } = useContext(SpotifyAutocompleteContext);
  const {
    data: collections = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["spotifyCollections"],
    queryFn: spotifyCollectionsQuery,
  });
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: spotifyUserInfo,
  });

  useEffect(() => {
    const hasPendingCover = collections.some(
      (collection) => collection.cover_status === "pending"
    );
    if (!hasPendingCover) return;

    const interval = window.setInterval(() => {
      refetch();
    }, 4000);

    return () => window.clearInterval(interval);
  }, [collections, refetch]);

  const itemContainerProps = {
    w: ["calc(100% - 16px)", null, "calc(50% - 16px)", "calc(25% - 16px)"],
  };

  return (
    <Box color="white">
      <Box p={[4, null, null, 8]}>
        <Heading mb={4}>Community Collections</Heading>

        {isLoading ? (
          <Wrap gap={[8, 4]}>
            {Array.from({ length: 8 }).map((_, index) => (
              <Box key={index} {...itemContainerProps}>
                <SpotifyCollectionCardSkeleton />
              </Box>
            ))}
          </Wrap>
        ) : isError ? (
          <Text color="whiteAlpha.700">Collections could not be loaded.</Text>
        ) : collections.length ? (
          <Wrap gap={[8, 4]}>
            {collections.map((collection) => (
              <Box key={collection.id} {...itemContainerProps}>
                <SpotifyCollectionCard
                  collection={collection}
                  currentUserId={user?.id}
                />
              </Box>
            ))}
          </Wrap>
        ) : (
          <Flex
            minH="240px"
            direction="column"
            justifyContent="center"
            alignItems="center"
            gap={3}
            color="whiteAlpha.700"
          >
            <Text>No collections have been shared yet.</Text>
            <Button colorPalette="whiteAlpha" onClick={() => setIsNew(true)}>
              Search for an artist
            </Button>
          </Flex>
        )}
      </Box>
    </Box>
  );
}
