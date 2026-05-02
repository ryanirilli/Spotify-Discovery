"use client";

import { FormEvent, useContext, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  CloseButton,
  Dialog,
  Icon,
  Input,
  Portal,
  Text,
} from "@chakra-ui/react";
import { MdIosShare } from "react-icons/md";
import {
  SpotifyRecommendationsContext,
  TSpotifyRecommendationsContext,
} from "./SpotifyRecommendationsProvider";
import { createSpotifyCollection } from "@/queries/spotifyCollections";
import { hasRecommendationSeeds } from "@/utils/spotifySearchConfig";
import { toaster } from "@/utils/toaster";

export default function SpotifyShareCollectionButton() {
  const queryClient = useQueryClient();
  const { artists, genres, filters } = useContext(
    SpotifyRecommendationsContext
  ) as TSpotifyRecommendationsContext;
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const config = { artists, genres, filters };
  const canShare = hasRecommendationSeeds(config);

  const mutation = useMutation({
    mutationFn: createSpotifyCollection,
    onSuccess: (collection) => {
      queryClient.invalidateQueries({ queryKey: ["spotifyCollections"] });
      toaster.create({
        title: `Shared "${collection.title}"`,
        type: "success",
        duration: 3000,
      });
      setTitle("");
      setOpen(false);
    },
    onError: (error) => {
      toaster.create({
        title:
          error instanceof Error ? error.message : "Couldn't share collection",
        type: "error",
        duration: 3000,
      });
    },
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle || mutation.isPending || !canShare) return;
    mutation.mutate({ title: trimmedTitle, config });
  };

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Trigger asChild>
        <Button
          size={["sm", "md"]}
          colorPalette="blackAlpha"
          borderRadius="full"
          disabled={!canShare}
        >
          <Icon as={MdIosShare} />
          Share
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="gray.950" color="white">
            <form onSubmit={onSubmit}>
              <Dialog.Header>
                <Dialog.Title>Share collection</Dialog.Title>
              </Dialog.Header>
              <Dialog.CloseTrigger asChild>
                <CloseButton
                  size="sm"
                  position="absolute"
                  top={2}
                  right={2}
                />
              </Dialog.CloseTrigger>
              <Dialog.Body p={4}>
                <Text mb={2} color="whiteAlpha.700" fontSize="sm">
                  Name this search configuration.
                </Text>
                <Input
                  autoFocus
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Collection title"
                  maxLength={80}
                  bg="whiteAlpha.100"
                />
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  w="100%"
                  type="submit"
                  loading={mutation.isPending}
                  disabled={!title.trim()}
                >
                  Share collection
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
