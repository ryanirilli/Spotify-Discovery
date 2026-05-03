"use client";

import { useContext, useEffect, useRef, useState, ViewTransition } from "react";
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
  const { recommendations, isLoadingRecs } = useContext(
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
  const { isLoadingRecs, addArtists, fetchRecs, isSeedLimitReached } =
    useContext(
      SpotifyRecommendationsContext
    ) as TSpotifyRecommendationsContext;
  const artistId = rec.artists?.[0]?.id;
  const onAddArtistToSeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!artistId || isSeedLimitReached) return;
    addArtists([artistId]);
    setTimeout(() => fetchRecs(), 0);
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

  useEffect(() => {
    const isPlaying = previewRef.current && !previewRef.current.paused;
    const isPlayingButNotCurrentTrack = isPlaying && curTrack !== rec.id;
    const isPlayingAndLoadingRecs = isPlaying && isLoadingRecs;

    if (isPlayingButNotCurrentTrack || isPlayingAndLoadingRecs) {
      pauseTrack();
    }
  }, [curTrack, rec, isLoadingRecs]);

  // Drive the progress bar from the audio element's own events while playing.
  // This avoids relying on HTMLMediaElement.play() promise timing and keeps
  // updates in sync with React's render cycle.
  useEffect(() => {
    if (!isPlaying) return;
    const el = previewRef.current;
    if (!el) return;

    let rafId: number | null = null;
    const tick = () => {
      if (el.paused || el.ended) {
        rafId = null;
        return;
      }
      if (el.duration > 0) {
        setTrackProgress((el.currentTime / el.duration) * 100);
      }
      rafId = requestAnimationFrame(tick);
    };
    // Kick the loop once the element is actually playing. Use the native
    // `playing` event to avoid racing the async play() promise; fall back
    // to starting immediately if the element is already unpaused.
    const onPlaying = () => {
      if (rafId === null) rafId = requestAnimationFrame(tick);
    };
    el.addEventListener("playing", onPlaying);
    if (!el.paused) onPlaying();

    return () => {
      el.removeEventListener("playing", onPlaying);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [isPlaying]);

  const playTrack = () => {
    const el = previewRef.current;
    if (!el) return;
    // Call play() synchronously inside the user gesture so iOS Safari keeps
    // the activation context; only flip state once playback actually starts.
    const playPromise = el.play();
    setIsPlaying(true);
    playPromise?.catch((err) => {
      console.warn("Audio preview failed to play", err);
      setIsPlaying(false);
    });
  };

  const pauseTrack = () => {
    setIsPlaying(false);
    previewRef.current?.pause();
  };

  const toggleTrack = () => {
    if (previewRef.current?.paused) {
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
            src={rec.preview_url}
            ref={previewRef}
            loop
            preload="auto"
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
              <Text fontWeight="bold" fontSize="small" color="white">
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
              <Text fontSize="small" color="whiteAlpha.700">
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
          <Flex>
            <Button
              visual="ghost"
              size="sm"
              aria-label="Add artist to search"
              borderRadius={0}
              flex={1}
              minW={0}
              h="64px"
              px={1}
              gap={1}
              flexDirection="column"
              disabled={!artistId || isSeedLimitReached}
              onClick={onAddArtistToSeed}
            >
              <Icon boxSize={5} as={TbMusicPlus} />
              <Text
                as="span"
                fontSize="xs"
                lineHeight="1.1"
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
                  borderRadius={0}
                  flex={1}
                  minW={0}
                  h="64px"
                  px={1}
                  gap={1}
                  flexDirection="column"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Icon boxSize={5} as={TbPlaylist} />
                  <Text
                    as="span"
                    fontSize="xs"
                    lineHeight="1.1"
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
              borderRadius={0}
              flex={1}
              minW={0}
              h="64px"
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
                  fontSize="xs"
                  lineHeight="1.1"
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
