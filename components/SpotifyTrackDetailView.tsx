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
import { TSpotifyAlbum } from "@/types/SpotifyAlbum";
import { TSpotifyAlbumTrack } from "@/types/SpotifyAlbumTrack";
import animationData from "@/public/sound-bars.json";
import Lottie from "./Lottie";
import { LoadingBox, LoadingTextRows } from "./LoadingSkeleton";
import SpotifyTrackDetails from "./SpotifyTrackDetails";
import SpotifyLink from "./SpotifyLink";
import SpotifyAddToPlaylistMenu from "./SpotifyAddToPlaylistMenu";
import {
  SpotifyCurrentTrackContext,
  TSpotifyCurrentTrackContext,
} from "./SpotifyCurrentTrackProvider";
import {
  SpotifyRecommendationsContext,
  TSpotifyRecommendationsContext,
} from "./SpotifyRecommendationsProvider";

const lottiePlayerOptions = { animationData };

type TPreviewTrack = {
  id: string;
  preview_url: string | null;
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
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [lastPreviewTrackId, setLastPreviewTrackId] = useState<string | null>(
    null
  );
  const [trackProgress, setTrackProgress] = useState(0);
  const [menuOpenTrackId, setMenuOpenTrackId] = useState<string | null>(null);

  const { curTrack, setCurTrack } =
    useContext<TSpotifyCurrentTrackContext | null>(
      SpotifyCurrentTrackContext
    ) || {};

  const { addArtists, fetchRecs, isSeedLimitReached } = useContext(
    SpotifyRecommendationsContext
  ) as TSpotifyRecommendationsContext;
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
    addArtists([artistId]);
    setTimeout(() => fetchRecs(), 0);
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

  const artist = artistQuery.data;
  const albums: TSpotifyAlbum[] = albumsQuery.data?.items || [];
  const albumImageUrl = useMemo(
    () => track?.album?.images?.[0]?.url,
    [track]
  );
  const isTrackPreviewPlayable = Boolean(track?.preview_url);
  const shouldShowMainTrackProgress = Boolean(
    track && lastPreviewTrackId === track.id
  );

  return (
    <Box color="white">
      <Box
        bg="gray.900/70"
        backdropFilter="blur(12px) saturate(140%)"
        p={[1, 2]}
        position="sticky"
        top={0}
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
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={6}
          alignItems="flex-start"
        >
          <Box
            w={{ base: "100%", md: "320px" }}
            flexShrink={0}
          >
            {track && (
              <Stack gap={4}>
                <Heading as="h2" size="md">
                  Track Details
                </Heading>
                <Box
                  borderWidth="1px"
                  borderColor="whiteAlpha.300"
                  borderRadius="md"
                  overflow="hidden"
                  bg="blackAlpha.300"
                >
                  <Box bg="whiteAlpha.100">
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
                  </Box>
                  <Stack gap={4} p={4}>
                    <Box>
                      <SpotifyLink isExternal rec={track}>
                        <Text fontWeight="bold" color="white" lineClamp={1}>
                          {track.name}
                        </Text>
                      </SpotifyLink>
                      <Text fontSize="xs" color="gray.400" lineClamp={1}>
                        {track.album.name}
                      </Text>
                    </Box>
                    <Stack gap={2}>
                      <SpotifyAddToPlaylistMenu
                        track={track}
                        trigger={
                          <Button
                            visual="primary"
                            size="sm"
                            w="100%"
                          >
                            <Icon as={MdPlaylistAdd} boxSize={5} />
                            Add to playlist
                          </Button>
                        }
                      />
                      <Button
                        visual="primary"
                        size="sm"
                        w="100%"
                        disabled={isSeedLimitReached}
                        onClick={onAddArtistToSeed}
                      >
                        <Icon as={AiOutlineUserAdd} boxSize={4} />
                        Add artist as seed
                      </Button>
                    </Stack>
                    <SpotifyTrackDetails id={track.id} />
                  </Stack>
                </Box>
              </Stack>
            )}
            {!track && trackQuery.isLoading && (
              <Stack gap={4}>
                <Heading as="h2" size="md">
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
            <Flex alignItems="center" gap={3} minW={0}>
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
                <Heading as="h1" size="md" lineClamp={1}>
                  {artist?.name ||
                    track?.artists?.[0]?.name ||
                    (artistQuery.isLoading ? "…" : "Artist")}
                </Heading>
                {artist?.followers?.total !== undefined && (
                  <Text fontSize="sm" color="gray.400">
                    {artist.followers.total.toLocaleString()} followers
                  </Text>
                )}
              </Box>
            </Flex>
            <Heading as="h2" size="md">
              Discography
            </Heading>
            <Box>
              {!artistId || albumsQuery.isLoading ? (
                <DiscographySkeleton />
              ) : albums.length === 0 ? (
                <Text color="gray.400" py={4}>
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
            <Text lineClamp={1}>{album.name}</Text>
            <Text fontSize="xs" color="gray.400" textTransform="capitalize">
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
            <LoadingTextRows
              count={album.total_tracks}
              px={3}
              my={2}
              height="18px"
              widths={["94%", "78%", "88%", "64%"]}
            />
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
                          <Text fontSize="sm" color="gray.400">
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
                      <Text fontSize="sm" lineClamp={1}>
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
                        <Text fontSize="xs" color="gray.400">
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
