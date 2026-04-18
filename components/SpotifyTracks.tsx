"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { MdExpandMore, MdPlaylistAdd } from "react-icons/md";
import { BiBarChartAlt2 } from "react-icons/bi";
import { AiOutlineUserAdd } from "react-icons/ai";
import {
  AspectRatio,
  Box,
  Button,
  Card,
  Flex,
  Icon,
  IconButton,
  Image,
  Menu,
  Popover,
  Portal,
  Progress,
  Text,
  useBreakpointValue,
  useDisclosure,
  VisuallyHidden,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import {
  SpotifyRecommendationsContext,
  TSpotifyRecommendationsContext,
} from "./SpotifyRecommendationsProvider";
import { TSpotifyTrack } from "@/types/SpotifyTrack";
import { TSpotifyArtist } from "@/types/SpotifyArtist";
import {
  SpotifyCurrentTrackContext,
  TSpotifyCurrentTrackContext,
} from "./SpotifyCurrentTrackProvider";
import { SpotifyPlaylistsContext } from "./SpotifyPlaylistsProvider";
import animationData from "@/public/sound-bars.json";
import Lottie from "./Lottie";
import SpotifyTrackDetails from "./SpotifyTrackDetails";
import { DragPreviewImage, useDrag } from "react-dnd";
import LazyImage from "./LazyImage";
import SpotifyLink from "./SpotifyLink";
import SpotifyAddTrackToPlaylistModal from "./SpotifyAddTrackToPlaylistModal";

const lottiePlayerOptions = { animationData };

export default function SpotifyTracks() {
  const { recommendations, isLoadingRecs } = useContext(
    SpotifyRecommendationsContext
  ) as TSpotifyRecommendationsContext;

  const { playlists } = useContext(SpotifyPlaylistsContext) || {};

  const [selectedTrack, setSelectedTrack] = useState<TSpotifyTrack | null>(
    null
  );

  const playlistsModal = useDisclosure();

  const onAddTrackToPlaylist = useCallback(
    (track: TSpotifyTrack) => {
      setSelectedTrack(track);
      playlistsModal.onOpen();
    },
    [playlistsModal]
  );

  const onClose = useCallback(() => {
    setSelectedTrack(null);
    playlistsModal.onClose();
  }, [playlistsModal]);

  return (
    <>
      <Wrap gap={0} px={4} pb={32}>
        {recommendations.map((rec) => (
          <WrapItem
            w={["100%", null, "50%", "25%", null, "16.66%"]}
            key={rec.id}
            position="relative"
          >
            <SpotifyTrack
              rec={rec}
              onAddTrackToPlaylist={onAddTrackToPlaylist}
            />
          </WrapItem>
        ))}
      </Wrap>
      <SpotifyAddTrackToPlaylistModal
        playlists={playlists}
        selectedTrack={selectedTrack}
        isOpen={playlistsModal.open}
        onClose={onClose}
      />
    </>
  );
}

function SpotifyTrack({
  rec,
  onAddTrackToPlaylist,
}: {
  rec: TSpotifyTrack;
  onAddTrackToPlaylist: (track: TSpotifyTrack) => void;
}) {
  const { isSeedLimitReached, addArtists, fetchRecs, isLoadingRecs } =
    useContext(SpotifyRecommendationsContext) as TSpotifyRecommendationsContext;
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
  const previewRef = useRef<HTMLAudioElement>(null);
  const onMouseEnterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [trackProgress, setTrackProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const detailsPopover = useDisclosure();

  const shouldFlipPopover = useBreakpointValue({
    base: false,
    md: true,
  });

  useEffect(() => {
    const isPlaying = previewRef.current && !previewRef.current.paused;
    const isPlayingButNotCurrentTrack = isPlaying && curTrack !== rec.id;
    const isPlayingAndLoadingRecs = isPlaying && isLoadingRecs;

    if (isPlayingButNotCurrentTrack || isPlayingAndLoadingRecs) {
      pauseTrack();
    }
  }, [curTrack, rec, isLoadingRecs]);

  // Close details popover when a different track becomes current.
  useEffect(() => {
    if (detailsPopover.open && curTrack !== rec.id) {
      detailsPopover.onClose();
    }
  }, [curTrack, rec.id, detailsPopover]);

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

  const handleMouseEnter = () => {
    if (isTouchDevice) {
      return;
    }
    onMouseEnterTimeoutRef.current = setTimeout(playTrack, 300);
  };

  const handleMouseLeave = () => {
    if (isTouchDevice) {
      return;
    }
    clearTimeout(onMouseEnterTimeoutRef.current!);
    pauseTrack();
  };

  const onAddArtistToSeed = async () => {
    let artist: TSpotifyArtist | null = null;
    try {
      const res = await fetch(
        `/api/spotify-get-artist-details?artistId=${rec.artists[0].id}`
      );
      artist = await res.json();
    } catch (error) {
      console.error(error);
    }
    artist && addArtists([artist.id]);
    setTimeout(() => fetchRecs(), 0);
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
                <LazyImage
                  w="100%"
                  objectFit={"cover"}
                  src={albumImageUrl}
                  alt="album art"
                />
              )}
            </Box>
          </AspectRatio>

          <Flex
            pointerEvents="none"
            bg="gray.200"
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
              src="Spotify_Logo_RGB_Black.png"
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
        <Progress.Root h={2} value={trackProgress}>
          <Progress.Track>
            <Progress.Range
              borderRightRadius="full"
              transition="none"
            />
          </Progress.Track>
        </Progress.Root>
        <Box bg="white" alignItems="center" borderBottomRadius="md">
          <Flex p={2}>
            <Box flex={1} minW={0}>
              <Text fontWeight="bold" fontSize="small">
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
                  >
                    {rec.name}
                  </SpotifyLink>
                )}
              </Text>
              <Text fontSize="small" color="gray.500">
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
                  >
                    {rec.artists.map((a) => a.name).join(", ")}
                  </SpotifyLink>
                )}
              </Text>
            </Box>
          </Flex>
          <Flex>
            <Popover.Root
              lazyMount
              open={detailsPopover.open}
              onOpenChange={(e) => detailsPopover.setOpen(e.open)}
              positioning={{
                placement: "top-start",
                flip: shouldFlipPopover,
              }}
            >
              <Popover.Trigger asChild>
                <IconButton
                  variant="outline"
                  size="sm"
                  aria-label="Track details"
                  borderRadius={0}
                  flex={1}
                  borderRight="none"
                  borderBottom="none"
                  borderLeft="none"
                >
                  <Icon boxSize={4} as={BiBarChartAlt2} />
                </IconButton>
              </Popover.Trigger>
              <Portal>
                <Popover.Positioner>
                  <Popover.Content boxShadow="dark-lg">
                    <Popover.Arrow />
                    <Popover.Body p={0}>
                      <SpotifyTrackDetails id={rec.id} />
                      <Box p={2}>
                        <Button
                          borderRadius="full"
                          size="sm"
                          w="100%"
                          onClick={detailsPopover.onClose}
                        >
                          Done
                        </Button>
                      </Box>
                    </Popover.Body>
                  </Popover.Content>
                </Popover.Positioner>
              </Portal>
            </Popover.Root>
            <IconButton
              aria-label="Add to playlist database"
              variant="outline"
              size="sm"
              borderRadius={0}
              flex={1}
              onClick={() => onAddTrackToPlaylist(rec)}
              borderBottom="none"
              borderRight="none"
            >
              <Icon boxSize={6} as={MdPlaylistAdd} />
            </IconButton>
            <Menu.Root>
              <Menu.Trigger asChild>
                <IconButton
                  disabled={isSeedLimitReached}
                  aria-label="Add track or artist"
                  variant="outline"
                  size="sm"
                  borderRadius={0}
                  flex={1}
                  borderBottom="none"
                  borderRight="none"
                >
                  <Icon boxSize={6} as={MdExpandMore} />
                </IconButton>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <Menu.Item
                      value="add-artist-as-seed"
                      onClick={() => onAddArtistToSeed()}
                    >
                      <Icon
                        boxSize={6}
                        as={AiOutlineUserAdd}
                        transform="translateY(2px)"
                      />
                      Add artist as seed
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </Flex>
        </Box>
      </Card.Root>
    </>
  );
}
