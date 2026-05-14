"use client";

import { useContext, useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AspectRatio,
  Box,
  Dialog,
  Heading,
  Icon,
  Menu,
  Portal,
  Text,
} from "@chakra-ui/react";
import {
  MdDeleteOutline,
  MdMoreVert,
} from "react-icons/md";
import CollectionCoverPlaceholder from "./CollectionCoverPlaceholder";
import LazyImage from "./LazyImage";
import { Button, IconButton } from "@/components/ui/Button";
import { SpotifyRecommendationsContext } from "./SpotifyRecommendationsProvider";
import { deleteSpotifyCollection } from "@/queries/spotifyCollections";
import { TSpotifyCollection } from "@/types/SpotifyCollection";
import { getArtistNamesLabel } from "@/utils/collectionArtists";
import { buildSearchStringFromConfig } from "@/utils/spotifySearchConfig";
import { toaster } from "@/utils/toaster";

type SpotifyCollectionCardProps = {
  collection: TSpotifyCollection;
  currentUserId?: string | null;
};

export function SpotifyCollectionCard({
  collection,
  currentUserId,
}: SpotifyCollectionCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setSearchConfig } = useContext(SpotifyRecommendationsContext) || {};
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const canDelete =
    !!currentUserId && currentUserId === collection.owner_spotify_user_id;
  const artistNames = collection.artist_snapshot.map((artist) => artist.name);
  const artistNamesLabel = getArtistNamesLabel(artistNames);
  const fullArtistNamesLabel = artistNames.join(", ");

  const deleteMutation = useMutation({
    mutationFn: () => deleteSpotifyCollection(collection.id),
    onSuccess: () => {
      setDeleteDialogOpen(false);
      queryClient.setQueryData<TSpotifyCollection[]>(
        ["spotifyCollections"],
        (current) =>
          current?.filter((item) => item.id !== collection.id) ?? current
      );
      queryClient.invalidateQueries({ queryKey: ["spotifyCollections"] });
      toaster.create({
        title: "Collection deleted",
        type: "success",
        duration: 2500,
      });
    },
    onError: (error) => {
      toaster.create({
        title:
          error instanceof Error
            ? error.message
            : "Could not delete collection",
        type: "error",
        duration: 3000,
      });
    },
  });

  const onSelectCollection = () => {
    setSearchConfig?.(collection.config);
    const qs = buildSearchStringFromConfig(collection.config);
    const href = qs ? `/search?${qs}` : "/search";

    window.scrollTo(0, 0);
    router.push(href, { scroll: true });
    window.requestAnimationFrame(() => window.scrollTo(0, 0));
  };

  const stopCardClick = (event: SyntheticEvent) => {
    event.stopPropagation();
  };

  const onOpenDeleteDialog = (event: SyntheticEvent) => {
    event.stopPropagation();
    deleteMutation.reset();
    setDeleteDialogOpen(true);
  };

  const onConfirmDelete = () => {
    if (!deleteMutation.isPending) {
      deleteMutation.mutate();
    }
  };

  const onCancelDelete = () => {
    if (!deleteMutation.isPending) {
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
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
        {canDelete && (
          <Menu.Root>
            <Menu.Trigger asChild>
              <IconButton
                aria-label="Collection options"
                position="absolute"
                top={2}
                right={2}
                zIndex={2}
                size="sm"
                bg="blackAlpha.600"
                color="white"
                _hover={{ bg: "blackAlpha.800" }}
                _active={{ bg: "blackAlpha.900" }}
                onPointerDown={stopCardClick}
                onClick={stopCardClick}
              >
                <Icon as={MdMoreVert} boxSize={5} />
              </IconButton>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content bg="blackAlpha.900" color="white" minW="180px">
                  <Menu.Item
                    value="delete"
                    bg="transparent"
                    color="white"
                    textStyle="body"
                    _hover={{ bg: "whiteAlpha.200" }}
                    onClick={onOpenDeleteDialog}
                  >
                    <Icon boxSize={5} as={MdDeleteOutline} color="white" />
                    Delete collection
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        )}
        <AspectRatio ratio={1} overflow="hidden" bg="blackAlpha.600">
          {collection.cover_image_url &&
          collection.cover_status === "ready" ? (
            <LazyImage
              src={collection.cover_image_url}
              alt=""
              w="100%"
              h="100%"
              objectFit="cover"
              placeholderSeed={collection.id}
            />
          ) : (
            <CollectionCoverPlaceholder seed={collection.id || collection.title} />
          )}
        </AspectRatio>
        <Box p={3} minH={artistNamesLabel ? "104px" : "84px"}>
          <Heading
            as="h4"
            color="whiteAlpha.900"
            textStyle="itemTitle"
            lineClamp={1}
            title={collection.title}
          >
            {collection.title}
          </Heading>
          {artistNamesLabel && (
            <Text
              mt={1}
              color="whiteAlpha.800"
              textStyle="itemMeta"
              lineClamp={1}
              title={fullArtistNamesLabel}
            >
              {artistNamesLabel}
            </Text>
          )}
          <Text mt={1} color="whiteAlpha.600" textStyle="itemMeta" lineClamp={1}>
            {collection.owner_display_name
              ? `Shared by ${collection.owner_display_name}`
              : "Shared collection"}
          </Text>
        </Box>
      </Box>

      {canDelete && (
        <Dialog.Root
          open={deleteDialogOpen}
          onOpenChange={(event) => {
            if (!deleteMutation.isPending) {
              setDeleteDialogOpen(event.open);
            }
          }}
        >
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner padding={[4, 6]}>
              <Dialog.Content
                bg="gray.950"
                color="white"
                borderRadius={["3xl", "xl"]}
                overflow="hidden"
                w="100%"
                maxW="sm"
              >
                <Dialog.Header>
                  <Dialog.Title textStyle="dialogTitle">
                    Delete collection
                  </Dialog.Title>
                </Dialog.Header>
                <Dialog.Body px={6} py={3}>
                  <Text color="whiteAlpha.700" textStyle="body">
                    Are you sure you want to remove &quot;{collection.title}&quot;
                    from Community Collections?
                  </Text>
                </Dialog.Body>
                <Dialog.Footer px={6} pb={6} gap={3}>
                  <Button
                    visual="secondary"
                    disabled={deleteMutation.isPending}
                    onClick={onCancelDelete}
                  >
                    Cancel
                  </Button>
                  <Button
                    visual="primary"
                    bg="red.500"
                    _hover={{ bg: "red.400" }}
                    _active={{ bg: "red.600" }}
                    disabled={deleteMutation.isPending}
                    onClick={onConfirmDelete}
                  >
                    <Icon as={MdDeleteOutline} boxSize={5} />
                    {deleteMutation.isPending ? "Deleting" : "Delete"}
                  </Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      )}
    </>
  );
}
