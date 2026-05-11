"use client";

import {
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ViewTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AspectRatio,
  Box,
  Flex,
  FlexProps,
  Heading,
  Icon,
  Image,
  Progress,
  Stack,
  Text,
  VisuallyHidden,
} from "@chakra-ui/react";
import { Button } from "@/components/ui/Button";
import { useQuery } from "@tanstack/react-query";
import { AiOutlineUserAdd } from "react-icons/ai";
import { MdAdd, MdArrowBack, MdPlaylistAdd } from "react-icons/md";

import spotifyTrackQuery from "@/queries/spotifyTrackQuery";
import spotifyArtistDetailsQuery from "@/queries/spotifyArtistDetailsQuery";
import spotifyGetArtistAlbumsQuery from "@/queries/spotifyGetArtistAlbumsQuery";
import spotifyGetAlbumTracksQuery from "@/queries/spotifyGetAlbumTracksQuery";
import scrollBarStyle from "@/utils/scrollBarStyle";
import useHoverPreview from "@/utils/useHoverPreview";
import useElementHeight from "@/utils/useElementHeight";
import { TSpotifyAlbum } from "@/types/SpotifyAlbum";
import { TSpotifyAlbumTrack } from "@/types/SpotifyAlbumTrack";
import { TSpotifyArtist } from "@/types/SpotifyArtist";
import { TSpotifyTrack } from "@/types/SpotifyTrack";
import animationData from "@/public/sound-bars.json";
import Lottie from "./Lottie";
import { LoadingBox } from "./LoadingSkeleton";
import SpotifyTrackDetails from "./SpotifyTrackDetails";
import SpotifyLink from "./SpotifyLink";
import SpotifyAddToPlaylistMenu from "./SpotifyAddToPlaylistMenu";
import { buildSearchStringFromConfig } from "@/utils/spotifySearchConfig";
import { TopNavHeightContext } from "./DesktopAppLayout";
import {
  SpotifyCurrentTrackContext,
  TSpotifyCurrentTrackContext,
} from "./SpotifyCurrentTrackProvider";
import {
  SpotifyRecommendationsContext,
  TSpotifyRecommendationsContext,
} from "./SpotifyRecommendationsProvider";

const lottiePlayerOptions = { animationData };
const ALBUM_TRACK_ROW_HEIGHT = "50px";
const SIDEBAR_COLLAPSE_TRANSITION = "450ms cubic-bezier(0.87, 0, 0.13, 1)";
const STICKY_ACTION_FADE_OUT_MS = 120;
const STICKY_ACTION_RETRACT_OFFSET_PX = 28;

type TPreviewTrack = {
  id: string;
  preview_url: string | null;
};

type TSpotifyArtistDetails = TSpotifyArtist & {
  followers?: {
    total?: number;
  };
};

export default function SpotifyTrackDetailView({ id }: { id: string }) {
  const router = useRouter();

  const trackQuery = useQuery({
    queryKey: ["spotifyTrack", id],
    queryFn: () => spotifyTrackQuery(id),
  });
  const track = trackQuery.data;
  const artistId = track?.artists?.[0]?.id ?? null;

  const artistQuery = useQuery({
    queryKey: ["spotifyArtistDetails", artistId],
    queryFn: () => spotifyArtistDetailsQuery(artistId as string),
    enabled: Boolean(artistId),
  });

  const albumsQuery = useQuery({
    queryKey: ["spotifyArtistAlbums", artistId],
    queryFn: () => spotifyGetArtistAlbumsQuery(artistId as string),
    enabled: Boolean(artistId),
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const backBarRef = useRef<HTMLDivElement>(null);
  const stickyMediaRef = useRef<HTMLDivElement>(null);
  const trackDetailsCardRef = useRef<HTMLDivElement>(null);
  const previousDetailsCardBottomRef = useRef<number | null>(null);
  const stickyActionsFadeTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const stickyActionsVisibleRef = useRef(false);
  const stickyActionsFadingRef = useRef(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [lastPreviewTrackId, setLastPreviewTrackId] = useState<string | null>(
    null
  );
  const [trackProgress, setTrackProgress] = useState(0);
  const [menuOpenTrackId, setMenuOpenTrackId] = useState<string | null>(null);
  const [showStickyTrackActions, setShowStickyTrackActions] = useState(false);
  const [isFadingStickyTrackActions, setIsFadingStickyTrackActions] =
    useState(false);

  const { curTrack, setCurTrack } =
    useContext<TSpotifyCurrentTrackContext | null>(
      SpotifyCurrentTrackContext
    ) || {};

  const { addArtists, isSeedLimitReached, artists, genres, filters } =
    useContext(SpotifyRecommendationsContext) as TSpotifyRecommendationsContext;
  const { topNavHeight } = useContext(TopNavHeightContext);
  const backBarHeight = useElementHeight(backBarRef);
  const stickyTrackDetailsTop = topNavHeight + backBarHeight;
  const [hoverPreviewEnabled] = useHoverPreview();

  useEffect(() => {
    if (playingTrackId && curTrack !== playingTrackId) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
    }
  }, [curTrack, playingTrackId]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (stickyActionsFadeTimeoutRef.current) {
        clearTimeout(stickyActionsFadeTimeoutRef.current);
      }
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (!playingTrackId) {
      return;
    }
    const el = audioRef.current;
    if (!el) return;
    let rafId: number | null = null;
    const tick = () => {
      if (!el || el.paused || el.ended) {
        rafId = null;
        return;
      }
      if (el.duration > 0) {
        setTrackProgress((el.currentTime / el.duration) * 100);
      }
      rafId = requestAnimationFrame(tick);
    };
    const onPlaying = () => {
      if (rafId === null) rafId = requestAnimationFrame(tick);
    };
    el.addEventListener("playing", onPlaying);
    if (!el.paused) onPlaying();
    return () => {
      el.removeEventListener("playing", onPlaying);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [playingTrackId]);

  useEffect(() => {
    if (!track) {
      stickyActionsVisibleRef.current = false;
      stickyActionsFadingRef.current = false;
      if (stickyActionsFadeTimeoutRef.current) {
        clearTimeout(stickyActionsFadeTimeoutRef.current);
        stickyActionsFadeTimeoutRef.current = null;
      }
      setIsFadingStickyTrackActions(false);
      setShowStickyTrackActions(false);
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 48rem)");
    let frameId: number | null = null;

    const clearStickyActionsFade = () => {
      if (!stickyActionsFadeTimeoutRef.current) return;
      clearTimeout(stickyActionsFadeTimeoutRef.current);
      stickyActionsFadeTimeoutRef.current = null;
    };

    const revealStickyActions = () => {
      clearStickyActionsFade();
      stickyActionsVisibleRef.current = true;
      stickyActionsFadingRef.current = false;
      setIsFadingStickyTrackActions(false);
      setShowStickyTrackActions(true);
    };

    const hideStickyActions = (quickFade: boolean) => {
      if (quickFade && stickyActionsFadingRef.current) return;
      clearStickyActionsFade();

      if (quickFade && stickyActionsVisibleRef.current) {
        stickyActionsFadingRef.current = true;
        setIsFadingStickyTrackActions(true);
        stickyActionsFadeTimeoutRef.current = setTimeout(() => {
          stickyActionsFadeTimeoutRef.current = null;
          stickyActionsVisibleRef.current = false;
          stickyActionsFadingRef.current = false;
          setShowStickyTrackActions(false);
          setIsFadingStickyTrackActions(false);
        }, STICKY_ACTION_FADE_OUT_MS);
        return;
      }

      stickyActionsVisibleRef.current = false;
      stickyActionsFadingRef.current = false;
      setShowStickyTrackActions(false);
      setIsFadingStickyTrackActions(false);
    };

    const updateStickyActions = () => {
      frameId = null;

      const stickyMedia = stickyMediaRef.current;
      const trackDetailsCard = trackDetailsCardRef.current;
      if (!stickyMedia || !trackDetailsCard || !mediaQuery.matches) {
        previousDetailsCardBottomRef.current = null;
        hideStickyActions(false);
        return;
      }

      const mediaRect = stickyMedia.getBoundingClientRect();
      const cardRect = trackDetailsCard.getBoundingClientRect();
      const previousCardBottom = previousDetailsCardBottomRef.current;
      const isScrollingBackToTop =
        previousCardBottom !== null && cardRect.bottom > previousCardBottom;
      const isMediaPinned = mediaRect.top <= stickyTrackDetailsTop + 1;
      const hasCardClearedMedia = cardRect.bottom <= mediaRect.bottom;
      const isCardCloseToReturning =
        cardRect.bottom >= mediaRect.bottom - STICKY_ACTION_RETRACT_OFFSET_PX;

      previousDetailsCardBottomRef.current = cardRect.bottom;

      if (!isMediaPinned) {
        hideStickyActions(false);
        return;
      }

      if (
        stickyActionsVisibleRef.current &&
        isScrollingBackToTop &&
        isCardCloseToReturning
      ) {
        hideStickyActions(true);
        return;
      }

      if (
        (!stickyActionsVisibleRef.current || stickyActionsFadingRef.current) &&
        hasCardClearedMedia
      ) {
        revealStickyActions();
      }
    };

    const scheduleUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateStickyActions);
    };

    updateStickyActions();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    mediaQuery.addEventListener("change", scheduleUpdate);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      clearStickyActionsFade();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      mediaQuery.removeEventListener("change", scheduleUpdate);
    };
  }, [stickyTrackDetailsTop, track?.id]);

  const playPreview = (previewTrack: TPreviewTrack) => {
    const el = audioRef.current;
    if (!el || !previewTrack.preview_url) return;
    if (lastPreviewTrackId !== previewTrack.id) {
      setTrackProgress(0);
      el.src = previewTrack.preview_url;
    } else if (!el.src) {
      el.src = previewTrack.preview_url;
    }
    const playPromise = el.play();
    setLastPreviewTrackId(previewTrack.id);
    setPlayingTrackId(previewTrack.id);
    setCurTrack?.(previewTrack.id);
    playPromise?.catch(() => setPlayingTrackId(null));
  };

  const stopPreview = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    audioRef.current?.pause();
    setPlayingTrackId(null);
  };

  const onTrackMouseEnter = (previewTrack: TPreviewTrack) => {
    const isTouch =
      typeof window !== "undefined" && window.ontouchstart !== undefined;
    if (isTouch || !hoverPreviewEnabled || menuOpenTrackId) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => playPreview(previewTrack), 300);
  };

  const onTrackMouseLeave = () => {
    const isTouch =
      typeof window !== "undefined" && window.ontouchstart !== undefined;
    if (isTouch || !hoverPreviewEnabled) return;
    stopPreview();
  };

  const onMenuOpenChange = (trackId: string, open: boolean) => {
    if (open) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      audioRef.current?.pause();
      setPlayingTrackId(null);
      setMenuOpenTrackId(trackId);
    } else {
      setMenuOpenTrackId((cur) => (cur === trackId ? null : cur));
    }
  };

  const onTrackClick = (previewTrack: TPreviewTrack) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (playingTrackId === previewTrack.id) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      playPreview(previewTrack);
    }
  };

  const onAddArtistToSeed = () => {
    if (!artistId) return;
    const nextConfig = {
      artists: [...artists, artistId],
      genres,
      filters,
    };
    const qs = buildSearchStringFromConfig(nextConfig);

    addArtists([artistId], artist ? [artist] : undefined);
    startTransition(() => {
      router.push(qs ? `/search?${qs}` : "/search");
    });
  };

  const onBack = () => {
    startTransition(() => {
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push("/search");
      }
    });
  };

  const artist = artistQuery.data as TSpotifyArtistDetails | undefined;
  const albums: TSpotifyAlbum[] = albumsQuery.data?.items || [];
  const albumImageUrl = useMemo(
    () => track?.album?.images?.[0]?.url,
    [track]
  );
  const isTrackPreviewPlayable = Boolean(track?.preview_url);
  const shouldShowMainTrackProgress = Boolean(
    track && lastPreviewTrackId === track.id
  );
  const stickyActionsMaxHeight = `max(112px, calc(100dvh - ${stickyTrackDetailsTop}px - 320px))`;
  return (
    <Box color="white">
      <Box
        ref={backBarRef}
        bg="gray.900/70"
        backdropFilter="blur(12px) saturate(140%)"
        p={[1, 2]}
        position="sticky"
        top={`${topNavHeight}px`}
        zIndex="banner"
      >
        <Flex alignItems="center" ml={[1, 0]}>
          <Button
            visual="ghost"
            size={["sm", "md"]}
            onClick={onBack}
          >
            <Icon as={MdArrowBack} boxSize={5} />
            Back
          </Button>
        </Flex>
      </Box>

      <Box p={[4, 6, 8]}>
        <ArtistSummary
          artist={artist}
          fallbackName={track?.artists?.[0]?.name}
          isLoading={trackQuery.isLoading || artistQuery.isLoading}
          display={{ base: "flex", md: "none" }}
          mb={4}
        />
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={6}
          alignItems="flex-start"
        >
          <Box
            w={{ base: "100%", md: "320px" }}
            flexShrink={0}
            alignSelf={{ md: "stretch" }}
          >
            {track && (
              <>
                <Heading as="h2" textStyle="sectionTitle" mb={4}>
                  Track Details
                </Heading>
                <Box
                  position={{ base: "static", md: "sticky" }}
                  top={{ md: `${stickyTrackDetailsTop}px` }}
                  zIndex="docked"
                >
                  <Box
                    ref={stickyMediaRef}
                    borderWidth="1px"
                    borderColor="whiteAlpha.300"
                    borderRadius="md"
                    bg="whiteAlpha.100"
                    overflow="hidden"
                  >
                    <AspectRatio
                      ratio={1}
                      cursor={isTrackPreviewPlayable ? "pointer" : "default"}
                      onMouseEnter={() => onTrackMouseEnter(track)}
                      onMouseLeave={onTrackMouseLeave}
                      onClick={() => onTrackClick(track)}
                    >
                      {albumImageUrl ? (
                        <ViewTransition
                          name={`album-art-${track.id}`}
                          share="morph"
                        >
                          <Image
                            alt={`${track.album.name} cover art`}
                            src={albumImageUrl}
                            w="100%"
                            h="100%"
                            objectFit="cover"
                          />
                        </ViewTransition>
                      ) : (
                        <Box />
                      )}
                    </AspectRatio>
                  </Box>
                  <Box
                    display={{ base: "none", md: "block" }}
                    position="absolute"
                    top="100%"
                    left={0}
                    right={0}
                    maxH={showStickyTrackActions ? stickyActionsMaxHeight : "0"}
                    overflowX="hidden"
                    overflowY={showStickyTrackActions ? "auto" : "hidden"}
                    opacity={
                      showStickyTrackActions && !isFadingStickyTrackActions
                        ? 1
                        : 0
                    }
                    pointerEvents={
                      showStickyTrackActions && !isFadingStickyTrackActions
                        ? "auto"
                        : "none"
                    }
                    transition={[
                      `max-height ${SIDEBAR_COLLAPSE_TRANSITION}`,
                      `opacity ${
                        isFadingStickyTrackActions
                          ? `${STICKY_ACTION_FADE_OUT_MS}ms ease`
                          : "0ms linear"
                      }`,
                    ].join(", ")}
                    css={scrollBarStyle}
                  >
                    <Stack
                      gap={3}
                      pt={2}
                      transform={`translateY(${
                        showStickyTrackActions ? "0" : "-100%"
                      })`}
                      transition={`transform ${SIDEBAR_COLLAPSE_TRANSITION}`}
                    >
                      <Box>
                        <SpotifyLink isExternal rec={track}>
                          <Text textStyle="itemTitle" color="white" lineClamp={1}>
                            {track.name}
                          </Text>
                        </SpotifyLink>
                        <Text textStyle="itemMeta" color="gray.400" lineClamp={1}>
                          {track.album.name}
                        </Text>
                      </Box>
                      <TrackActionButtons
                        track={track}
                        isSeedLimitReached={isSeedLimitReached}
                        onAddArtistToSeed={onAddArtistToSeed}
                      />
                    </Stack>
                  </Box>
                </Box>
                <Box
                  ref={trackDetailsCardRef}
                  mt={4}
                  borderWidth="1px"
                  borderColor="whiteAlpha.300"
                  borderRadius="md"
                  bg="blackAlpha.300"
                  overflow="hidden"
                >
                  <Progress.Root
                    value={shouldShowMainTrackProgress ? trackProgress : 0}
                  >
                    <Progress.Track h="2px" bg="whiteAlpha.200">
                      <Progress.Range
                        bg="electricPurple.500"
                        borderRightRadius="full"
                        transition="none"
                      />
                    </Progress.Track>
                  </Progress.Root>
                  <Stack gap={4} p={4}>
                    <Box>
                      <SpotifyLink isExternal rec={track}>
                        <Text textStyle="itemTitle" color="white" lineClamp={1}>
                          {track.name}
                        </Text>
                      </SpotifyLink>
                      <Text textStyle="itemMeta" color="gray.400" lineClamp={1}>
                        {track.album.name}
                      </Text>
                    </Box>
                    <Stack gap={2}>
                      <TrackActionButtons
                        track={track}
                        isSeedLimitReached={isSeedLimitReached}
                        onAddArtistToSeed={onAddArtistToSeed}
                      />
                    </Stack>
                    <SpotifyTrackDetails id={track.id} />
                  </Stack>
                </Box>
              </>
            )}
            {!track && trackQuery.isLoading && (
              <Stack gap={4}>
                <Heading as="h2" textStyle="sectionTitle">
                  Track Details
                </Heading>
                <Box
                  borderWidth="1px"
                  borderColor="whiteAlpha.300"
                  borderRadius="md"
                  overflow="hidden"
                  bg="blackAlpha.300"
                >
                  <AspectRatio ratio={1}>
                    <LoadingBox w="100%" h="100%" borderRadius="0" />
                  </AspectRatio>
                  <Stack gap={4} p={4}>
                    <LoadingBox h="20px" w="80%" borderRadius="full" />
                    <LoadingBox h="16px" w="60%" borderRadius="full" />
                    <LoadingBox h="32px" borderRadius="full" />
                    <LoadingBox h="32px" borderRadius="full" />
                  </Stack>
                </Box>
              </Stack>
            )}
          </Box>

          <Stack
            flex={1}
            minW={0}
            w="100%"
            gap={4}
            pt={{ base: 0, md: 10 }}
            css={scrollBarStyle}
          >
            <ArtistSummary
              artist={artist}
              fallbackName={track?.artists?.[0]?.name}
              isLoading={trackQuery.isLoading || artistQuery.isLoading}
              display={{ base: "none", md: "flex" }}
            />
            <Heading as="h2" textStyle="sectionTitle">
              Discography
            </Heading>
            <Box>
              {!artistId || albumsQuery.isLoading ? (
                <DiscographySkeleton />
              ) : albums.length === 0 ? (
                <Text textStyle="statusText" color="gray.400" py={4}>
                  No albums found.
                </Text>
              ) : (
                <Accordion.Root multiple>
                  {albums.map((album) => (
                    <AlbumAccordionItem
                      key={album.id}
                      album={album}
                      playingTrackId={playingTrackId}
                      menuOpenTrackId={menuOpenTrackId}
                      trackProgress={trackProgress}
                      onTrackMouseEnter={onTrackMouseEnter}
                      onTrackMouseLeave={onTrackMouseLeave}
                      onTrackClick={onTrackClick}
                      onMenuOpenChange={onMenuOpenChange}
                    />
                  ))}
                </Accordion.Root>
              )}
            </Box>
          </Stack>
        </Flex>

        <VisuallyHidden>
          <audio ref={audioRef} preload="auto" playsInline loop />
        </VisuallyHidden>
      </Box>
    </Box>
  );
}

function DiscographySkeleton() {
  return (
    <Stack gap={0}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Flex key={index} alignItems="center" gap={3} py={2} opacity={0.75}>
          <LoadingBox boxSize="48px" flexShrink={0} borderRadius="sm" />
          <Box flex={1} minW={0}>
            <LoadingBox
              h="18px"
              w={index % 2 === 0 ? "78%" : "64%"}
              mb={2}
              borderRadius="full"
            />
            <LoadingBox
              h="12px"
              w={index % 3 === 0 ? "42%" : "54%"}
              borderRadius="full"
            />
          </Box>
        </Flex>
      ))}
    </Stack>
  );
}

interface ITrackActionButtons {
  track: TSpotifyTrack;
  isSeedLimitReached: boolean;
  onAddArtistToSeed: () => void;
}

function TrackActionButtons({
  track,
  isSeedLimitReached,
  onAddArtistToSeed,
}: ITrackActionButtons) {
  return (
    <>
      <SpotifyAddToPlaylistMenu
        track={track}
        autoFocusInput={false}
        trigger={
          <Button visual="primary" size="sm" w="100%">
            <Icon as={MdPlaylistAdd} boxSize={5} />
            Add to playlist
          </Button>
        }
      />
      <Button
        visual="secondary"
        size="sm"
        w="100%"
        disabled={isSeedLimitReached}
        onClick={onAddArtistToSeed}
      >
        <Icon as={AiOutlineUserAdd} boxSize={4} />
        Add artist as seed
      </Button>
    </>
  );
}

interface IArtistSummary extends FlexProps {
  artist?: TSpotifyArtistDetails;
  fallbackName?: string;
  isLoading?: boolean;
}

function ArtistSummary({
  artist,
  fallbackName,
  isLoading = false,
  ...props
}: IArtistSummary) {
  return (
    <Flex alignItems="center" gap={3} minW={0} {...props}>
      <Box
        boxSize="48px"
        flexShrink={0}
        borderRadius="full"
        overflow="hidden"
        bg="whiteAlpha.100"
      >
        {artist?.images?.[0]?.url ? (
          <Image
            alt={artist?.name || "artist"}
            src={artist.images[0].url}
            w="100%"
            h="100%"
            objectFit="cover"
          />
        ) : (
          <LoadingBox w="100%" h="100%" borderRadius="full" />
        )}
      </Box>
      <Box minW={0}>
        <Heading as="h1" textStyle="pageTitle" lineClamp={1}>
          {artist?.name || fallbackName || (isLoading ? "..." : "Artist")}
        </Heading>
        {artist?.followers?.total !== undefined && (
          <Text textStyle="itemMeta" color="gray.400">
            {artist.followers.total.toLocaleString()} followers
          </Text>
        )}
      </Box>
    </Flex>
  );
}

function AlbumTrackSkeletonRows({ count }: { count: number }) {
  return (
    <Box>
      {Array.from({ length: count }).map((_, index) => (
        <Flex
          key={index}
          alignItems="center"
          justifyContent="space-between"
          minH={ALBUM_TRACK_ROW_HEIGHT}
          py={2}
          px={3}
          borderTop="1px solid transparent"
          opacity={0.75}
        >
          <Flex gap={3} minW={0} flex={1} alignItems="center">
            <Box w="24px" h="20px" flexShrink={0}>
              <LoadingBox
                h="12px"
                w={index < 9 ? "10px" : "18px"}
                mt="4px"
                ml="auto"
                borderRadius="full"
              />
            </Box>
            <LoadingBox
              h="18px"
              w={index % 2 === 0 ? "72%" : "56%"}
              maxW="420px"
              borderRadius="full"
            />
          </Flex>
          <LoadingBox h="12px" w="34px" ml={2} borderRadius="full" />
        </Flex>
      ))}
    </Box>
  );
}

interface IAlbumAccordionItem {
  album: TSpotifyAlbum;
  playingTrackId: string | null;
  menuOpenTrackId: string | null;
  trackProgress: number;
  onTrackMouseEnter: (track: TSpotifyAlbumTrack) => void;
  onTrackMouseLeave: () => void;
  onTrackClick: (track: TSpotifyAlbumTrack) => void;
  onMenuOpenChange: (trackId: string, open: boolean) => void;
}

function AlbumAccordionItem({
  album,
  playingTrackId,
  menuOpenTrackId,
  trackProgress,
  onTrackMouseEnter,
  onTrackMouseLeave,
  onTrackClick,
  onMenuOpenChange,
}: IAlbumAccordionItem) {
  const [hasOpened, setHasOpened] = useState(false);

  const tracksQuery = useQuery({
    queryKey: ["spotifyAlbumTracks", album.id],
    queryFn: () => spotifyGetAlbumTracksQuery(album.id),
    enabled: hasOpened,
  });

  const year = album.release_date?.slice(0, 4);
  const tracks: TSpotifyAlbumTrack[] = tracksQuery.data?.items || [];

  return (
    <Accordion.Item value={album.id} borderColor="whiteAlpha.200">
      <Accordion.ItemTrigger
        py={2}
        onClick={() => setHasOpened(true)}
        cursor="pointer"
        _hover={{ bg: "whiteAlpha.100" }}
      >
        <Flex alignItems="center" gap={3} flex={1} minW={0} textAlign="left">
          <Box
            boxSize="48px"
            flexShrink={0}
            bg="whiteAlpha.100"
            overflow="hidden"
          >
            <AspectRatio ratio={1}>
              {album.images?.[0]?.url ? (
                <Image
                  alt={album.name}
                  src={album.images[0].url}
                  w="100%"
                  h="100%"
                  objectFit="cover"
                />
              ) : (
                <Box />
              )}
            </AspectRatio>
          </Box>
          <Box flex={1} minW={0}>
            <Text textStyle="itemTitle" lineClamp={1}>{album.name}</Text>
            <Text textStyle="itemMeta" color="gray.400" textTransform="capitalize">
              {[year, album.album_type, `${album.total_tracks} tracks`]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          </Box>
        </Flex>
        <Accordion.ItemIndicator />
      </Accordion.ItemTrigger>
      <Accordion.ItemContent>
        <Accordion.ItemBody pt={0} pb={2}>
          {tracksQuery.isLoading ? (
            <AlbumTrackSkeletonRows count={album.total_tracks} />
          ) : (
            <Box>
              {tracks.map((track) => {
                const playable = Boolean(track.preview_url);
                const isActive = playingTrackId === track.id;
                const isMenuOpen = menuOpenTrackId === track.id;
                const showActions = isActive || isMenuOpen;
                return (
                  <Flex
                    key={track.id}
                    position="relative"
                    alignItems="center"
                    justifyContent="space-between"
                    minH={ALBUM_TRACK_ROW_HEIGHT}
                    py={2}
                    px={3}
                    borderRadius="sm"
                    borderTop="1px solid transparent"
                    bg={showActions ? "whiteAlpha.200" : "transparent"}
                    opacity={playable ? 1 : 0.5}
                    cursor={playable ? "pointer" : "default"}
                    transition="background 0.15s"
                    _hover={playable ? { bg: "whiteAlpha.100" } : undefined}
                    onMouseEnter={() =>
                      playable && onTrackMouseEnter(track)
                    }
                    onMouseLeave={onTrackMouseLeave}
                    onClick={() => playable && onTrackClick(track)}
                  >
                    <Box
                      position="absolute"
                      top="-1px"
                      left={0}
                      h="1px"
                      w={isActive ? `${trackProgress}%` : "0%"}
                      bg="electricPurple.500"
                      pointerEvents="none"
                    />
                    <Flex gap={3} minW={0} flex={1} alignItems="center">
                      <Box
                        position="relative"
                        w="24px"
                        h="20px"
                        flexShrink={0}
                        overflow="hidden"
                      >
                        <Flex
                          position="absolute"
                          inset={0}
                          alignItems="center"
                          justifyContent="flex-end"
                          transition="transform 0.25s ease-in-out"
                          transform={`translateY(${isActive ? "-100%" : "0%"})`}
                        >
                          <Text textStyle="itemMeta" color="gray.400">
                            {track.track_number}
                          </Text>
                        </Flex>
                        <Flex
                          position="absolute"
                          inset={0}
                          alignItems="center"
                          justifyContent="flex-end"
                          transition="transform 0.25s ease-in-out"
                          transform={`translateY(${isActive ? "0%" : "100%"})`}
                        >
                          <Lottie
                            lottiePlayerOptions={lottiePlayerOptions}
                            isPlaying={isActive}
                            w="20px"
                            h="20px"
                          />
                        </Flex>
                      </Box>
                      <Text textStyle="itemTitle" lineClamp={1}>
                        {track.name}
                      </Text>
                    </Flex>
                    <Flex
                      position="relative"
                      flexShrink={0}
                      ml={2}
                      overflow="hidden"
                      alignItems="center"
                    >
                      <Box
                        transition="transform 0.25s ease-in-out"
                        transform={`translateY(${showActions ? "0%" : "100%"})`}
                      >
                        <SpotifyAddToPlaylistMenu
                          track={{
                            id: track.id,
                            name: track.name,
                            preview_url: track.preview_url ?? "",
                            artists: track.artists,
                            uri: track.uri,
                            external_urls: track.external_urls,
                            album: {
                              name: album.name,
                              preview_url: "",
                              images: album.images,
                            },
                          }}
                          onOpenChange={(open) =>
                            onMenuOpenChange(track.id, open)
                          }
                          trigger={
                            <Button
                              visual="primary"
                              size="xs"
                              aria-label="Add to playlist"
                              tabIndex={showActions ? 0 : -1}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Icon as={MdAdd} boxSize={4} />
                              Add to playlist
                            </Button>
                          }
                        />
                      </Box>
                      <Flex
                        position="absolute"
                        inset={0}
                        alignItems="center"
                        justifyContent="flex-end"
                        pointerEvents="none"
                        transition="transform 0.25s ease-in-out"
                        transform={`translateY(${showActions ? "-100%" : "0%"})`}
                      >
                        <Text textStyle="itemMeta" color="gray.400">
                          {msToMinSec(track.duration_ms)}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                );
              })}
            </Box>
          )}
        </Accordion.ItemBody>
      </Accordion.ItemContent>
    </Accordion.Item>
  );
}

function msToMinSec(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
