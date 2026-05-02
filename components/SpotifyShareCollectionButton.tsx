"use client";

import { FormEvent, useContext, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AspectRatio,
  Box,
  Button,
  Clipboard,
  CloseButton,
  Dialog,
  Flex,
  Heading,
  Icon,
  IconButton,
  Image,
  Input,
  Portal,
  Text,
} from "@chakra-ui/react";
import {
  MdCheck,
  MdContentCopy,
  MdImageNotSupported,
  MdIosShare,
} from "react-icons/md";
import CollectionCoverSwirl from "./CollectionCoverSwirl";
import {
  SpotifyRecommendationsContext,
  TSpotifyRecommendationsContext,
} from "./SpotifyRecommendationsProvider";
import {
  createSpotifyCollection,
  spotifyCollectionByIdQuery,
} from "@/queries/spotifyCollections";
import {
  buildSearchStringFromConfig,
  hasRecommendationSeeds,
} from "@/utils/spotifySearchConfig";
import { TSpotifyCollection } from "@/types/SpotifyCollection";
import { toaster } from "@/utils/toaster";

type Step = "name" | "created";

export default function SpotifyShareCollectionButton() {
  const queryClient = useQueryClient();
  const { artists, genres, filters } = useContext(
    SpotifyRecommendationsContext
  ) as TSpotifyRecommendationsContext;
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("name");
  const [title, setTitle] = useState("");
  const [collection, setCollection] = useState<TSpotifyCollection | null>(null);
  const config = { artists, genres, filters };
  const canShare = hasRecommendationSeeds(config);

  const polling = useQuery({
    queryKey: ["spotifyCollection", collection?.id],
    queryFn: () => spotifyCollectionByIdQuery(collection!.id),
    enabled:
      open &&
      step === "created" &&
      !!collection &&
      collection.cover_status === "pending",
    refetchInterval: 1500,
  });

  useEffect(() => {
    const next = polling.data;
    if (!next) return;
    setCollection(next);
    if (next.cover_status !== "pending") {
      queryClient.invalidateQueries({ queryKey: ["spotifyCollections"] });
    }
  }, [polling.data, queryClient]);

  const mutation = useMutation({
    mutationFn: createSpotifyCollection,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["spotifyCollections"] });
      setCollection(created);
      setStep("created");
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

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      // Wait for the close animation before resetting so the user
      // doesn't see the form flash back on the way out.
      setTimeout(() => {
        setStep("name");
        setTitle("");
        setCollection(null);
        mutation.reset();
      }, 200);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle || mutation.isPending || !canShare) return;
    mutation.mutate({ title: trimmedTitle, config });
  };

  const shareUrl = (() => {
    if (!collection || typeof window === "undefined") return "";
    const qs = buildSearchStringFromConfig(collection.config);
    return qs
      ? `${window.location.origin}/search?${qs}`
      : `${window.location.origin}/search`;
  })();

  return (
    <Dialog.Root open={open} onOpenChange={(e) => handleOpenChange(e.open)}>
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
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" position="absolute" top={2} right={2} />
            </Dialog.CloseTrigger>
            {step === "name" || !collection ? (
              <NameStep
                title={title}
                onTitleChange={setTitle}
                onSubmit={onSubmit}
                isPending={mutation.isPending}
                canShare={canShare}
              />
            ) : (
              <CreatedStep
                collection={collection}
                shareUrl={shareUrl}
                onDone={() => handleOpenChange(false)}
              />
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

function NameStep({
  title,
  onTitleChange,
  onSubmit,
  isPending,
  canShare,
}: {
  title: string;
  onTitleChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  isPending: boolean;
  canShare: boolean;
}) {
  return (
    <form onSubmit={onSubmit}>
      <Dialog.Header>
        <Dialog.Title>Share collection</Dialog.Title>
      </Dialog.Header>
      <Dialog.Body p={4}>
        <Text mb={2} color="whiteAlpha.700" fontSize="sm">
          Name this collection. We&apos;ll generate a cover image for it.
        </Text>
        <Input
          autoFocus
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Collection title"
          maxLength={80}
          bg="whiteAlpha.100"
        />
      </Dialog.Body>
      <Dialog.Footer>
        <Button
          w="100%"
          type="submit"
          loading={isPending}
          disabled={!title.trim() || !canShare}
        >
          Continue
        </Button>
      </Dialog.Footer>
    </form>
  );
}

function CreatedStep({
  collection,
  shareUrl,
  onDone,
}: {
  collection: TSpotifyCollection;
  shareUrl: string;
  onDone: () => void;
}) {
  const isPending = collection.cover_status === "pending";
  const isFailed = collection.cover_status === "failed";
  const isReady =
    collection.cover_status === "ready" && !!collection.cover_image_url;

  return (
    <>
      <Dialog.Header>
        <Dialog.Title>
          {isPending ? "Creating your collection" : "Your collection is ready"}
        </Dialog.Title>
      </Dialog.Header>
      <Dialog.Body p={4}>
        <Flex direction="column" gap={4} alignItems="stretch">
          <Box mx="auto" w="60%" maxW="240px">
            <AspectRatio
              ratio={1}
              overflow="hidden"
              bg="blackAlpha.600"
              borderRadius="md"
            >
              {isReady ? (
                <Image
                  src={collection.cover_image_url!}
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
                  color="whiteAlpha.700"
                  bg="gray.950"
                >
                  {isPending ? (
                    <CollectionCoverSwirl />
                  ) : (
                    <Icon as={MdImageNotSupported} boxSize={10} />
                  )}
                </Flex>
              )}
            </AspectRatio>
          </Box>
          <Box textAlign="center">
            <Heading as="h3" size="md" color="whiteAlpha.900" lineClamp={2}>
              {collection.title}
            </Heading>
            <Text mt={1} color="whiteAlpha.600" fontSize="sm">
              {isPending
                ? "Generating cover…"
                : isFailed
                  ? "Cover unavailable — your link is ready"
                  : "Cover ready"}
            </Text>
          </Box>
          <Clipboard.Root value={shareUrl}>
            <Clipboard.Label
              fontSize="xs"
              color="whiteAlpha.700"
              mb={1}
              display="block"
            >
              Share link
            </Clipboard.Label>
            <Flex gap={2}>
              <Clipboard.Input asChild>
                <Input
                  readOnly
                  bg="whiteAlpha.100"
                  fontSize="sm"
                  flex={1}
                  onFocus={(event) => event.currentTarget.select()}
                />
              </Clipboard.Input>
              <Clipboard.Trigger asChild>
                <IconButton
                  aria-label="Copy share link"
                  variant="solid"
                  colorPalette="blackAlpha"
                >
                  <Clipboard.Indicator copied={<Icon as={MdCheck} />}>
                    <Icon as={MdContentCopy} />
                  </Clipboard.Indicator>
                </IconButton>
              </Clipboard.Trigger>
            </Flex>
          </Clipboard.Root>
        </Flex>
      </Dialog.Body>
      <Dialog.Footer>
        <Button w="100%" onClick={onDone}>
          Done
        </Button>
      </Dialog.Footer>
    </>
  );
}
