"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AspectRatio,
  Box,
  Flex,
  Heading,
  Icon,
  IconButton,
  Text,
} from "@chakra-ui/react";
import {
  MdDeleteOutline,
  MdImageNotSupported,
  MdLibraryMusic,
} from "react-icons/md";
import LazyImage from "./LazyImage";
import { SpotifyRecommendationsContext } from "./SpotifyRecommendationsProvider";
import { deleteSpotifyCollection } from "@/queries/spotifyCollections";
import { TSpotifyCollection } from "@/types/SpotifyCollection";
import { buildSearchStringFromConfig } from "@/utils/spotifySearchConfig";
import { toaster } from "@/utils/toaster";

type SpotifyCollectionCardProps = {
  collection: TSpotifyCollection;
  currentUserId?: string;
};

export function SpotifyCollectionCard({
  collection,
  currentUserId,
}: SpotifyCollectionCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setSearchConfig } = useContext(SpotifyRecommendationsContext) || {};
  const isOwner = currentUserId === collection.owner_spotify_user_id;
  const isPending = collection.cover_status === "pending";
  const isFailed = collection.cover_status === "failed";

  const deleteMutation = useMutation({
    mutationFn: deleteSpotifyCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spotifyCollections"] });
      toaster.create({
        title: "Collection deleted",
        type: "success",
        duration: 3000,
      });
    },
    onError: () => {
      toaster.create({
        title: "Couldn't delete collection",
        type: "error",
        duration: 3000,
      });
    },
  });

  const onSelectCollection = () => {
    setSearchConfig?.(collection.config);
    const qs = buildSearchStringFromConfig(collection.config);
    router.push(qs ? `/search?${qs}` : "/search");
  };

  const onDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (deleteMutation.isPending) return;
    if (!window.confirm(`Delete "${collection.title}"?`)) return;
    deleteMutation.mutate(collection.id);
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
      {isOwner && (
        <IconButton
          aria-label="Delete collection"
          size="sm"
          variant="solid"
          colorPalette="blackAlpha"
          position="absolute"
          top={2}
          right={2}
          zIndex={1}
          loading={deleteMutation.isPending}
          onClick={onDelete}
        >
          <Icon as={MdDeleteOutline} boxSize={5} />
        </IconButton>
      )}
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
              <Box
                position="absolute"
                inset={0}
                bg="gray.950"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: "absolute",
                  inset: "-35%",
                  bg: "conic-gradient(from 90deg, black, whiteAlpha.500, blackAlpha.700, whiteAlpha.300, black)",
                  filter: "blur(24px)",
                  opacity: 0.55,
                  animation: "collection-cover-swirl 3.8s linear infinite",
                }}
                _after={{
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  bg: "linear-gradient(135deg, blackAlpha.500, transparent 45%, whiteAlpha.100)",
                }}
                css={{
                  "@keyframes collection-cover-swirl": {
                    "0%": { transform: "rotate(0deg) scale(1.1)" },
                    "100%": { transform: "rotate(360deg) scale(1.1)" },
                  },
                }}
              />
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
