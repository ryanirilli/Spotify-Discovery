"use client";

import { FormEvent, useContext, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AspectRatio,
  Box,
  Clipboard,
  Dialog,
  Flex,
  Heading,
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
  MdIosShare,
} from "react-icons/md";
import CollectionCoverPlaceholder from "./CollectionCoverPlaceholder";
import DialogCloseButton from "./DialogCloseButton";
import { Button, IconButton } from "@/components/ui/Button";
import BottomSheet from "@/components/ui/BottomSheet";
import {
  SpotifyRecommendationsContext,
  TSpotifyRecommendationsContext,
} from "./SpotifyRecommendationsProvider";
import { createSpotifyCollection } from "@/queries/spotifyCollections";
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
  const openRef = useRef(false);
  const resetAfterSettleRef = useRef(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useBreakpointValue(
    { base: true, md: false },
    { ssr: false }
  );
  const shouldAutoFocusTitle = isMobile === false;
  const config = { artists, genres, filters };
  const canShare = hasRecommendationSeeds(config);
  const isCreated = step === "created" && !!collection;

  const mutation = useMutation({
    mutationFn: createSpotifyCollection,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["spotifyCollections"] });
      setCollection(created);
      setStep("created");
      if (!openRef.current) {
        toaster.create({
          title: "Shared to Community Collections",
          type: "success",
          duration: 3000,
        });
      }
    },
    onError: (error) => {
      toaster.create({
        title:
          error instanceof Error ? error.message : "Couldn't share collection",
        type: "error",
        duration: 3000,
      });
    },
    onSettled: () => {
      if (resetAfterSettleRef.current && !openRef.current) {
        resetAfterSettleRef.current = false;
        scheduleReset();
      }
    },
  });

  const scheduleReset = () => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = setTimeout(() => {
      resetTimerRef.current = null;
      setStep("name");
      setTitle("");
      setCollection(null);
      mutation.reset();
    }, 200);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    openRef.current = nextOpen;
    setOpen(nextOpen);
    if (nextOpen) {
      resetAfterSettleRef.current = false;
      return;
    }
    if (!nextOpen) {
      if (mutation.isPending) {
        resetAfterSettleRef.current = true;
        return;
      }
      scheduleReset();
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
  const submitLabel = isCreated
    ? "Close"
    : mutation.isPending
      ? "Sharing..."
      : "Share";
  const description = isCreated
    ? "Shared to Community Collections"
    : "Preview your card before it appears in Community Collections";
  const statusMessage = mutation.isPending
    ? "Sharing to Community Collections. You can close this and keep exploring."
    : isCreated
      ? "Shared to Community Collections."
      : "This is how the card will appear in the community feed.";
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
        aria-label="Collection title"
        maxLength={80}
        disabled={isCreated}
        required
      />
      <Box mx="auto" w="100%" maxW="280px">
        <CommunityCardPreview
          collection={collection}
          title={inputValue}
        />
      </Box>
      <Flex
        align="flex-start"
        gap={2}
        color="whiteAlpha.700"
        bg="whiteAlpha.100"
        borderWidth="1px"
        borderColor="whiteAlpha.100"
        borderRadius="md"
        px={3}
        py={2}
        aria-live="polite"
      >
        <Icon
          as={isCreated ? MdCheck : MdAutoAwesome}
          boxSize={4}
          color={isCreated ? "green.300" : "whiteAlpha.600"}
          mt="2px"
          flexShrink={0}
        />
        <Text textStyle="body">{statusMessage}</Text>
      </Flex>
      {isCreated && (
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
      )}
    </Flex>
  );

  if (isMobile !== false) {
    return (
      <BottomSheet
        open={open}
        onOpenChange={handleOpenChange}
        trigger={shareTrigger}
        title="Share with the community"
        doneLabel="Close"
      >
        <form onSubmit={onSubmit} noValidate>
          <Text color="whiteAlpha.700" textStyle="body" mb={4}>
            {description}
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
              <DialogCloseButton>Close</DialogCloseButton>
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
                  {description}
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

function CommunityCardPreview({
  collection,
  title,
}: {
  collection: TSpotifyCollection | null;
  title: string;
}) {
  const isReady =
    collection?.cover_status === "ready" && !!collection.cover_image_url;
  const displayTitle =
    collection?.title || title.trim() || "Untitled collection";
  const ownerLabel = collection
    ? collection.owner_display_name
      ? `Shared by ${collection.owner_display_name}`
      : "Shared collection"
    : "Shared by you";

  return (
    <Box
      overflow="hidden"
      borderRadius="md"
      bg="blackAlpha.400"
      borderWidth="1px"
      borderColor="whiteAlpha.100"
      boxShadow="0 18px 50px rgba(0, 0, 0, 0.35)"
      aria-label="Community collection card preview"
    >
      <AspectRatio ratio={1} overflow="hidden" bg="blackAlpha.600">
        {isReady ? (
          <Image
            src={collection.cover_image_url!}
            alt=""
            w="100%"
            h="100%"
            objectFit="cover"
          />
        ) : (
          <CollectionCoverPlaceholder />
        )}
      </AspectRatio>
      <Box p={3} minH="84px">
        <Heading
          as="h4"
          color="whiteAlpha.900"
          textStyle="itemTitle"
          lineClamp={1}
          title={displayTitle}
        >
          {displayTitle}
        </Heading>
        <Text mt={1} color="whiteAlpha.600" textStyle="itemMeta" lineClamp={1}>
          {ownerLabel}
        </Text>
      </Box>
    </Box>
  );
}
