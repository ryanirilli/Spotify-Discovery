"use client";

import { FormEvent, useContext, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AspectRatio,
  Box,
  Button,
  Clipboard,
  Dialog,
  Flex,
  Icon,
  IconButton,
  Image,
  Input,
  Portal,
  Text,
} from "@chakra-ui/react";
import {
  MdAutoAwesome,
  MdCheck,
  MdContentCopy,
  MdImage,
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
  const isCreated = step === "created" && !!collection;

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
    if (isCreated) {
      handleOpenChange(false);
      return;
    }
    const trimmedTitle = title.trim();
    if (!trimmedTitle || mutation.isPending || !canShare) return;
    mutation.mutate({ title: trimmedTitle, config });
  };

  const shareUrl = (() => {
    if (typeof window === "undefined") return "";
    const sourceConfig = collection?.config ?? config;
    const qs = buildSearchStringFromConfig(sourceConfig);
    return qs
      ? `${window.location.origin}/search?${qs}`
      : `${window.location.origin}/search`;
  })();

  const inputValue = isCreated ? collection.title : title;
  const submitDisabled = !isCreated && (!title.trim() || !canShare);
  const submitLabel = isCreated ? "Done" : "Generate cover image";

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
        <Dialog.Positioner padding={[4, 6]}>
          <Dialog.Content
            bg="gray.950"
            color="white"
            borderRadius={["3xl", "xl"]}
            overflow="hidden"
            w="100%"
            maxW="md"
          >
            <Dialog.CloseTrigger asChild>
              <Button
                size="sm"
                variant="solid"
                borderRadius="full"
                position="absolute"
                top={3}
                right={3}
                zIndex={1}
              >
                Done
              </Button>
            </Dialog.CloseTrigger>
            <form onSubmit={onSubmit}>
              <Dialog.Header
                pt={[6, 5]}
                px={[6, 5]}
                pb={2}
                flexDirection="column"
                alignItems="flex-start"
                gap={1}
              >
                <Dialog.Title>Share with the community</Dialog.Title>
                <Text color="whiteAlpha.700" fontSize="sm">
                  This will publish your session on the homepage
                </Text>
              </Dialog.Header>
              <Dialog.Body px={[6, 5]} py={4}>
                <Flex direction="column" gap={4}>
                  <Input
                    autoFocus={!isCreated}
                    value={inputValue}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Collection title"
                    maxLength={80}
                    disabled={isCreated}
                    required
                  />
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
                        <Input disabled fontSize="sm" flex={1} />
                      </Clipboard.Input>
                      <Clipboard.Trigger asChild>
                        <IconButton
                          aria-label="Copy share link"
                          variant="solid"
                          colorPalette="blackAlpha"
                        >
                          <Clipboard.Indicator
                            copied={<Icon as={MdCheck} />}
                          >
                            <Icon as={MdContentCopy} />
                          </Clipboard.Indicator>
                        </IconButton>
                      </Clipboard.Trigger>
                    </Flex>
                  </Clipboard.Root>
                  <Box mx="auto" w={["55%", "50%"]} maxW="200px">
                    <CoverPreview collection={collection} />
                  </Box>
                </Flex>
              </Dialog.Body>
              <Dialog.Footer px={[6, 5]} pb={[6, 5]}>
                <Button
                  w="100%"
                  type="submit"
                  loading={mutation.isPending}
                  disabled={submitDisabled}
                >
                  {submitLabel}
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

function CoverPreview({ collection }: { collection: TSpotifyCollection | null }) {
  const isReady =
    collection?.cover_status === "ready" && !!collection.cover_image_url;
  const isPending = collection?.cover_status === "pending";
  const isFailed = collection?.cover_status === "failed";

  return (
    <AspectRatio
      ratio={1}
      overflow="hidden"
      bg="blackAlpha.600"
      borderRadius="md"
      borderWidth="1px"
      borderColor="whiteAlpha.200"
      position="relative"
    >
      {isReady ? (
        <Image
          src={collection.cover_image_url!}
          alt=""
          w="100%"
          h="100%"
          objectFit="cover"
        />
      ) : isPending ? (
        <CollectionCoverSwirl />
      ) : (
        <Flex
          h="100%"
          w="100%"
          direction="column"
          alignItems="center"
          justifyContent="center"
          gap={2}
          bg="gray.950"
          color="whiteAlpha.400"
        >
          <Icon as={isFailed ? MdImageNotSupported : MdImage} boxSize={10} />
          <Flex align="center" gap={1} fontSize="xs">
            <Icon as={MdAutoAwesome} boxSize={3.5} />
            <Text as="span">Cover</Text>
          </Flex>
        </Flex>
      )}
    </AspectRatio>
  );
}
