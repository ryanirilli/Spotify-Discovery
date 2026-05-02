"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import {
  AspectRatio,
  Box,
  Flex,
  Heading,
  Icon,
  Text,
} from "@chakra-ui/react";
import { MdImageNotSupported, MdLibraryMusic } from "react-icons/md";
import CollectionCoverSwirl from "./CollectionCoverSwirl";
import LazyImage from "./LazyImage";
import { SpotifyRecommendationsContext } from "./SpotifyRecommendationsProvider";
import { TSpotifyCollection } from "@/types/SpotifyCollection";
import { buildSearchStringFromConfig } from "@/utils/spotifySearchConfig";

type SpotifyCollectionCardProps = {
  collection: TSpotifyCollection;
};

export function SpotifyCollectionCard({
  collection,
}: SpotifyCollectionCardProps) {
  const router = useRouter();
  const { setSearchConfig } = useContext(SpotifyRecommendationsContext) || {};
  const isPending = collection.cover_status === "pending";
  const isFailed = collection.cover_status === "failed";

  const onSelectCollection = () => {
    setSearchConfig?.(collection.config);
    const qs = buildSearchStringFromConfig(collection.config);
    router.push(qs ? `/search?${qs}` : "/search");
  };

  return (
    <Box
      role="button"
      cursor="pointer"
      onClick={onSelectCollection}
      borderRadius="md"
      h="100%"
      overflow="hidden"
      bg="blackAlpha.400"
      position="relative"
      _hover={{ bg: "blackAlpha.700" }}
    >
      <AspectRatio ratio={1} overflow="hidden" bg="blackAlpha.600">
        {collection.cover_image_url && collection.cover_status === "ready" ? (
          <LazyImage
            src={collection.cover_image_url}
            alt=""
            w="100%"
            h="100%"
            objectFit="cover"
          />
        ) : (
          <Flex
            h="100%"
            w="100%"
            position="relative"
            direction="column"
            alignItems="center"
            justifyContent="center"
            gap={3}
            color="whiteAlpha.700"
            bg="gray.950"
          >
            {isPending ? (
              <CollectionCoverSwirl />
            ) : (
              <>
                <Icon
                  as={isFailed ? MdImageNotSupported : MdLibraryMusic}
                  boxSize={10}
                />
                <Text fontSize="sm">
                  {isFailed ? "Cover unavailable" : "Collection"}
                </Text>
              </>
            )}
          </Flex>
        )}
      </AspectRatio>
      <Box p={3} minH="84px">
        <Heading
          as="h4"
          color="whiteAlpha.900"
          size="md"
          lineClamp={1}
          title={collection.title}
        >
          {collection.title}
        </Heading>
        <Text mt={1} color="whiteAlpha.600" fontSize="sm" lineClamp={1}>
          {collection.owner_display_name
            ? `Shared by ${collection.owner_display_name}`
            : "Shared collection"}
        </Text>
      </Box>
    </Box>
  );
}
