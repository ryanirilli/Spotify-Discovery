"use client";

import { FormEvent, useContext, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AspectRatio,
  Box,
  Clipboard,
  Dialog,
  Flex,
  Icon,
  Image,
  Input,
  Portal,
  Text,
  useBreakpointValue,
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
import DialogCloseButton from "./DialogCloseButton";
import { Button, IconButton } from "@/components/ui/Button";
import BottomSheet from "@/components/ui/BottomSheet";
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
    SpotifyRecommendationsContext,
  ) as TSpotifyRecommendationsContext;
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("name");
  const [title, setTitle] = useState("");
  const [collection, setCollection] = useState<TSpotifyCollection | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useBreakpointValue(
    { base: true, md: false },
    { ssr: false }
  );
  const shouldAutoFocusTitle = isMobile === false;
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
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    setOpen(nextOpen);
    if (!nextOpen) {
      resetTimerRef.current = setTimeout(() => {
        resetTimerRef.current = null;
        setStep("name");
        setTitle("");
        setCollection(null);
        mutation.reset();
      }, 200);
    }
  };

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    if (
      submitter instanceof HTMLElement &&
      submitter.dataset.shareSubmit !== "true"
    ) {
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
  const submitLabel = mutation.isPending
    ? "Generating cover image..."
    : isCreated
      ? "Done"
      : "Generate cover image";
  const handleClose = () => handleOpenChange(false);
  const shareTrigger = (
    <Button
      type="button"
      visual="secondary"
      size={["sm", "md"]}
      disabled={!canShare}
    >
      <Icon as={MdIosShare} />
      Share
    </Button>
  );
  const getSubmitButton = (onDone?: () => void) => (
    <Button
      visual="primary"
      w="100%"
      type={isCreated ? "button" : "submit"}
      data-share-submit={isCreated ? undefined : "true"}
      disabled={submitDisabled || mutation.isPending}
      onClick={isCreated ? onDone : undefined}
    >
      {submitLabel}
    </Button>
  );
  const formControls = (
    <Flex direction="column" gap={4}>
      <Input
        ref={titleInputRef}
        value={inputValue}
        textStyle="body"
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Collection title"
        maxLength={80}
        disabled={isCreated}
        required
      />
      <Clipboard.Root value={shareUrl}>
        <Clipboard.Label
          textStyle="microLabel"
          color="whiteAlpha.700"
          mb={1}
          display="block"
        >
          Share link
        </Clipboard.Label>
        <Flex gap={2}>
          <Clipboard.Input asChild>
            <Input disabled textStyle="body" flex={1} />
          </Clipboard.Input>
          <Clipboard.Trigger asChild>
            <IconButton visual="secondary" aria-label="Copy share link">
              <Clipboard.Indicator copied={<Icon as={MdCheck} />}>
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
  );

  if (isMobile !== false) {
    return (
      <BottomSheet
        open={open}
        onOpenChange={handleOpenChange}
        trigger={shareTrigger}
        title="Share with the community"
      >
        <form onSubmit={onSubmit} noValidate>
          <Text color="whiteAlpha.700" textStyle="body" mb={4}>
            Publish your search on the homepage
          </Text>
          {formControls}
          <Box mt={4} pt={3} pb={1} position="sticky" bottom="-12px" bg="black">
            {getSubmitButton(handleClose)}
          </Box>
        </form>
      </BottomSheet>
    );
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => handleOpenChange(e.open)}
      initialFocusEl={() =>
        shouldAutoFocusTitle ? titleInputRef.current : null
      }
    >
      <Dialog.Trigger asChild>
        {shareTrigger}
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
              <DialogCloseButton>Done</DialogCloseButton>
            </Dialog.CloseTrigger>
            <form onSubmit={onSubmit} noValidate>
              <Dialog.Header
                pt={[6, 5]}
                px={[6, 5]}
                pb={2}
                flexDirection="column"
                alignItems="flex-start"
                gap={1}
              >
                <Dialog.Title textStyle="dialogTitle">
                  Share with the community
                </Dialog.Title>
                <Text color="whiteAlpha.700" textStyle="body">
                  Publish your search on the homepage
                </Text>
              </Dialog.Header>
              <Dialog.Body px={[6, 5]} py={4}>
                {formControls}
              </Dialog.Body>
              <Dialog.Footer px={[6, 5]} pb={[6, 5]}>
                {isCreated ? (
                  <Dialog.CloseTrigger asChild>
                    {getSubmitButton()}
                  </Dialog.CloseTrigger>
                ) : (
                  getSubmitButton()
                )}
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

function CoverPreview({
  collection,
}: {
  collection: TSpotifyCollection | null;
}) {
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
          <Flex align="center" gap={1} textStyle="microLabel">
            <Icon as={MdAutoAwesome} boxSize={3.5} />
            <Text as="span" textStyle="microLabel">Cover</Text>
          </Flex>
        </Flex>
      )}
    </AspectRatio>
  );
}
