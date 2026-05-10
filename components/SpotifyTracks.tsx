"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ViewTransition,
} from "react";
import NextLink from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { TbListDetails, TbMusicPlus, TbPlaylist } from "react-icons/tb";
import {
  AspectRatio,
  Box,
  Card,
  Flex,
  Icon,
  Image,
  Progress,
  Text,
  VisuallyHidden,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { Button } from "@/components/ui/Button";
import {
  SpotifyRecommendationsContext,
  TSpotifyRecommendationsContext,
} from "./SpotifyRecommendationsProvider";
import { TSpotifyTrack } from "@/types/SpotifyTrack";
import {
  SpotifyCurrentTrackContext,
  TSpotifyCurrentTrackContext,
} from "./SpotifyCurrentTrackProvider";
import animationData from "@/public/sound-bars.json";
import Lottie from "./Lottie";
import { DragPreviewImage, useDrag } from "react-dnd";
import LazyImage from "./LazyImage";
import SpotifyLink from "./SpotifyLink";
import SpotifyAddToPlaylistMenu from "./SpotifyAddToPlaylistMenu";
import SpotifyTrackSkeleton from "./SpotifyTrackSkeleton";
import useHoverPreview from "@/utils/useHoverPreview";

const lottiePlayerOptions = { animationData };

export default function SpotifyTracks() {
  const { recommendations, isLoadingRecs, artists, genres } = useContext(
    SpotifyRecommendationsContext
  ) as TSpotifyRecommendationsContext;

  const itemWidth = ["100%", null, "50%", null, "33.333%", "25%"];

  if (isLoadingRecs && recommendations.length === 0) {
    return (
      <Wrap gap={0} px={4} pb={32}>
        {Array.from({ length: 12 }).map((_, index) => (
          <WrapItem w={itemWidth} key={index} position="relative">
            <SpotifyTrackSkeleton />
          </WrapItem>
        ))}
      </Wrap>
    );
  }

  if (
    !isLoadingRecs &&
    recommendations.length === 0 &&
    (artists.length > 0 || genres.length > 0)
  ) {
    return (
      <Flex
        minH="240px"
        alignItems="center"
        justifyContent="center"
        px={4}
        color="whiteAlpha.700"
      >
        <Text textStyle="statusText">
          No recommendations found. Try adjusting the tempo.
        </Text>
      </Flex>
    );
  }

  return (
    <Wrap gap={0} px={4} pb={32}>
      {recommendations.map((rec) => (
        <WrapItem w={itemWidth} key={rec.id} position="relative">
          <SpotifyTrack rec={rec} />
        </WrapItem>
      ))}
    </Wrap>
  );
}

function SpotifyTrack({ rec }: { rec: TSpotifyTrack }) {
  const {
    isLoadingRecs,
    addArtists,
    fetchRecs,
    isSeedLimitReached,
    artists,
    genres,
    filters,
  } = useContext(
    SpotifyRecommendationsContext
  ) as TSpotifyRecommendationsContext;
  const artistId = rec.artists?.[0]?.id;
  const onAddArtistToSeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!artistId || isSeedLimitReached) return;
    const nextConfig = {
      artists: [...artists, artistId],
      genres,
      filters,
    };
    addArtists([artistId]);
    void fetchRecs(nextConfig);
  };
  const [_, dragRef, dragPreviewRef] = useDrag(() => ({
    type: "SpotifyTrack",
    collect: (monitor) => ({
      isDragging: Boolean(monitor.isDragging()),
      previewOptions: {
        anchorX: 1,
        anchorY: 1,
      },
    }),
    item: rec,
  }));

  const { curTrack, setCurTrack } =
    useContext<TSpotifyCurrentTrackContext | null>(
      SpotifyCurrentTrackContext
    ) || {};
  const queryClient = useQueryClient();
  const previewRef = useRef<HTMLAudioElement>(null);
  const onMouseEnterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [trackProgress, setTrackProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const unloadPreview = useCallback(() => {
    const el = previewRef.current;
    if (!el) return;

    el.pause();
    el.removeAttribute("src");
    delete el.dataset.previewUrl;
    el.load();
  }, []);

  const pauseTrack = useCallback(() => {
    setIsPlaying(false);
    setTrackProgress(0);
    unloadPreview();
  }, [unloadPreview]);

  const playTrack = useCallback(() => {
    const el = previewRef.current;
    if (!el || !rec.preview_url || isLoadingRecs) return;

    if (el.dataset.previewUrl !== rec.preview_url) {
      setTrackProgress(0);
      el.src = rec.preview_url;
      el.dataset.previewUrl = rec.preview_url;
      el.load();
    }

    // Call play() synchronously inside the user gesture so iOS Safari keeps
    // the activation context; only flip state once playback actually starts.
    const playPromise = el.play();
    setCurTrack?.(rec.id);
    void playPromise
      ?.then(() => {
        if (el.dataset.previewUrl === rec.preview_url && !el.paused) {
          setIsPlaying(true);
        }
      })
      .catch((err) => {
        console.warn("Audio preview failed to play", err);
        setIsPlaying(false);
        unloadPreview();
      });
  }, [isLoadingRecs, rec.id, rec.preview_url, setCurTrack, unloadPreview]);

  useEffect(() => {
    const previewIsActive =
      previewRef.current?.dataset.previewUrl === rec.preview_url;
    const isPlayingButNotCurrentTrack = isPlaying && curTrack !== rec.id;
    const shouldReleasePreview =
      previewIsActive && (isPlayingButNotCurrentTrack || isLoadingRecs);

    if (shouldReleasePreview) {
      pauseTrack();
    }
  }, [curTrack, isLoadingRecs, isPlaying, pauseTrack, rec.id, rec.preview_url]);

  useEffect(() => {
    if (!isLoadingRecs) return;
    clearTimeout(onMouseEnterTimeoutRef.current ?? undefined);
    onMouseEnterTimeoutRef.current = null;
  }, [isLoadingRecs]);

  // Drive the progress bar from media events instead of a RAF loop. Updating
  // React state every frame can trip React's nested update guard in dev.
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;

    setTrackProgress(0);
    const markPlaying = () => setIsPlaying(true);
    const markPaused = () => setIsPlaying(false);

    const syncProgress = () => {
      const nextProgress =
        Number.isFinite(el.duration) && el.duration > 0
          ? (el.currentTime / el.duration) * 100
          : 0;
      setTrackProgress((current) =>
        Math.abs(current - nextProgress) < 0.1 ? current : nextProgress
      );
    };

    el.addEventListener("loadedmetadata", syncProgress);
    el.addEventListener("durationchange", syncProgress);
    el.addEventListener("timeupdate", syncProgress);
    el.addEventListener("seeked", syncProgress);
    el.addEventListener("ended", syncProgress);
    el.addEventListener("playing", markPlaying);
    el.addEventListener("pause", markPaused);

    return () => {
      el.removeEventListener("loadedmetadata", syncProgress);
      el.removeEventListener("durationchange", syncProgress);
      el.removeEventListener("timeupdate", syncProgress);
      el.removeEventListener("seeked", syncProgress);
      el.removeEventListener("ended", syncProgress);
      el.removeEventListener("playing", markPlaying);
      el.removeEventListener("pause", markPaused);
    };
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(onMouseEnterTimeoutRef.current ?? undefined);
      unloadPreview();
    };
  }, [unloadPreview]);

  const toggleTrack = () => {
    if (!isPlaying) {
      playTrack();
    } else {
      pauseTrack();
    }
  };

  const isTouchDevice =
    typeof window !== "undefined" && window.ontouchstart !== undefined;
  const albumImageUrl = rec.album.images[0]?.url;
  const [hoverPreviewEnabled] = useHoverPreview();

  const handleMouseEnter = () => {
    if (isTouchDevice || !hoverPreviewEnabled) {
      return;
    }
    onMouseEnterTimeoutRef.current = setTimeout(playTrack, 300);
  };

  const handleMouseLeave = () => {
    if (isTouchDevice || !hoverPreviewEnabled) {
      return;
    }
    clearTimeout(onMouseEnterTimeoutRef.current!);
    onMouseEnterTimeoutRef.current = null;
    pauseTrack();
  };

  return (
    <>
      <DragPreviewImage
        connect={dragPreviewRef}
        src="/spotify-track-drag-image.svg"
      />
      <Card.Root
        ref={dragRef as unknown as React.Ref<HTMLDivElement>}
        m={2}
        mb={[8, 2]}
        w="100%"
        bg={isLoadingRecs ? "black" : "transparent"}
        borderWidth="0"
        _hover={{ boxShadow: "outline" }}
        onMouseEnter={() => !isLoadingRecs && setCurTrack?.(rec.id)}
        onClick={() => !isLoadingRecs && setCurTrack?.(rec.id)}
      >
        <Box position="relative" overflow="hidden">
          <AspectRatio
            ratio={1}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={toggleTrack}
            overflow="hidden"
          >
            <Box>
              {albumImageUrl && !isLoadingRecs && (
                <ViewTransition name={`album-art-${rec.id}`} share="morph">
                  <LazyImage
                    w="100%"
                    objectFit={"cover"}
                    src={albumImageUrl}
                    alt="album art"
                  />
                </ViewTransition>
              )}
            </Box>
          </AspectRatio>

          <Flex
            pointerEvents="none"
            bg="gray.950"
            borderTopRadius="md"
            mt={2}
            justifyContent="space-between"
            alignItems="center"
            overflow="hidden"
          >
            <Box
              maxW="40px"
              transition={"transform 0.2s ease-in-out"}
              transform={`translateY(${isPlaying ? "0%" : "100%"})`}
            >
              <Lottie
                lottiePlayerOptions={lottiePlayerOptions}
                isPlaying={isPlaying}
              />
            </Box>
            <Image
              height="100%"
              alt="spotify logo"
              src="Spotify_Logo_RGB_White.png"
              maxW="64px"
              mr={2}
            />
          </Flex>
        </Box>
        <VisuallyHidden>
          <audio
            ref={previewRef}
            loop
            preload="none"
            playsInline
          />
        </VisuallyHidden>
        <Progress.Root value={trackProgress}>
          <Progress.Track h="2px" bg="whiteAlpha.200">
            <Progress.Range
              bg="electricPurple.500"
              borderRightRadius="full"
              transition="none"
            />
          </Progress.Track>
        </Progress.Root>
        <Box
          bg="gray.950"
          color="white"
          alignItems="center"
          borderBottomRadius="md"
          borderWidth="1px"
          borderTopWidth="0"
          borderColor="whiteAlpha.200"
        >
          <Flex p={2}>
            <Box flex={1} minW={0}>
              <Text textStyle="itemTitle" color="white">
                {isLoadingRecs ? (
                  "..."
                ) : (
                  <SpotifyLink
                    isExternal
                    rec={rec}
                    display="block"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    color="white"
                    _hover={{ color: "whiteAlpha.800" }}
                  >
                    {rec.name}
                  </SpotifyLink>
                )}
              </Text>
              <Text textStyle="itemMeta" color="whiteAlpha.700">
                {isLoadingRecs ? (
                  "..."
                ) : (
                  <SpotifyLink
                    isExternal
                    rec={rec}
                    display="block"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    color="whiteAlpha.700"
                    _hover={{ color: "whiteAlpha.900" }}
                  >
                    {rec.artists.map((a) => a.name).join(", ")}
                  </SpotifyLink>
                )}
              </Text>
            </Box>
          </Flex>
          <Flex p={1} gap={1}>
            <Button
              visual="ghost"
              size="sm"
              aria-label="Add artist to search"
              borderRadius="sm"
              flex={1}
              minW={0}
              h="56px"
              px={1}
              gap={1}
              flexDirection="column"
              disabled={!artistId || isSeedLimitReached}
              onClick={onAddArtistToSeed}
            >
              <Icon boxSize={5} as={TbMusicPlus} />
              <Text
                as="span"
                textStyle="microLabel"
                maxW="100%"
                textAlign="center"
              >
                Add to search
              </Text>
            </Button>
            <SpotifyAddToPlaylistMenu
              track={rec}
              trigger={
                <Button
                  visual="ghost"
                  size="sm"
                  aria-label="Add to playlist"
                  borderRadius="sm"
                  flex={1}
                  minW={0}
                  h="56px"
                  px={1}
                  gap={1}
                  flexDirection="column"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Icon boxSize={5} as={TbPlaylist} />
                  <Text
                    as="span"
                    textStyle="microLabel"
                    maxW="100%"
                    textAlign="center"
                  >
                    Add to playlist
                  </Text>
                </Button>
              }
            />
            <Button
              visual="ghost"
              size="sm"
              aria-label="Explore artist"
              borderRadius="sm"
              flex={1}
              minW={0}
              h="56px"
              px={1}
              gap={1}
              flexDirection="column"
              asChild
            >
              <NextLink
                href={`/track/${rec.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  queryClient.setQueryData(["spotifyTrack", rec.id], rec);
                }}
              >
                <Icon boxSize={5} as={TbListDetails} />
                <Text
                  as="span"
                  textStyle="microLabel"
                  maxW="100%"
                  textAlign="center"
                >
                  Explore artist
                </Text>
              </NextLink>
            </Button>
          </Flex>
        </Box>
      </Card.Root>
    </>
  );
}
