"use client";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AspectRatio,
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Image,
  Skeleton,
  Spinner,
  Stack,
  Text,
  VisuallyHidden,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { AiOutlineUserAdd } from "react-icons/ai";
import { MdArrowBack, MdPlaylistAdd } from "react-icons/md";

import spotifyTrackQuery from "@/queries/spotifyTrackQuery";
import spotifyArtistDetailsQuery from "@/queries/spotifyArtistDetailsQuery";
import spotifyGetArtistAlbumsQuery from "@/queries/spotifyGetArtistAlbumsQuery";
import spotifyGetAlbumTracksQuery from "@/queries/spotifyGetAlbumTracksQuery";
import scrollBarStyle from "@/utils/scrollBarStyle";
import { TSpotifyAlbum } from "@/types/SpotifyAlbum";
import { TSpotifyAlbumTrack } from "@/types/SpotifyAlbumTrack";
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

  const { curTrack, setCurTrack } =
    useContext<TSpotifyCurrentTrackContext | null>(
      SpotifyCurrentTrackContext
    ) || {};

  const { addArtists, fetchRecs, isSeedLimitReached } = useContext(
    SpotifyRecommendationsContext
  ) as TSpotifyRecommendationsContext;

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

  const playPreview = (previewTrack: TSpotifyAlbumTrack) => {
    const el = audioRef.current;
    if (!el || !previewTrack.preview_url) return;
    el.src = previewTrack.preview_url;
    const playPromise = el.play();
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

  const onTrackMouseEnter = (previewTrack: TSpotifyAlbumTrack) => {
    const isTouch =
      typeof window !== "undefined" && window.ontouchstart !== undefined;
    if (isTouch) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => playPreview(previewTrack), 300);
  };

  const onAddArtistToSeed = () => {
    if (!artistId) return;
    addArtists([artistId]);
    setTimeout(() => fetchRecs(), 0);
  };

  const onBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/search");
    }
  };

  const artist = artistQuery.data;
  const albums: TSpotifyAlbum[] = albumsQuery.data?.items || [];
  const albumImageUrl = useMemo(
    () => track?.album?.images?.[0]?.url,
    [track]
  );

  return (
    <Box color="white" p={[4, 6, 8]}>
      <Flex mb={[4, 6]} alignItems="center" gap={4} flexWrap="wrap">
        <Button
          size="sm"
          variant="ghost"
          color="white"
          borderRadius="full"
          _hover={{ bg: "whiteAlpha.200" }}
          _active={{ bg: "whiteAlpha.300" }}
          onClick={onBack}
        >
          <Icon as={MdArrowBack} boxSize={5} />
          Back
        </Button>

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
              <Skeleton w="100%" h="100%" />
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
      </Flex>

      <Flex
        direction={{ base: "column", md: "row" }}
        gap={6}
        alignItems="flex-start"
      >
        <Box
          w={{ base: "100%", md: "320px" }}
          flexShrink={0}
          position={{ base: "static", md: "sticky" }}
          top={4}
        >
          {track && (
            <Stack gap={4}>
              <Box borderRadius="md" overflow="hidden" bg="whiteAlpha.100">
                <AspectRatio ratio={1}>
                  {albumImageUrl ? (
                    <Image
                      alt={`${track.album.name} cover art`}
                      src={albumImageUrl}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                    />
                  ) : (
                    <Box />
                  )}
                </AspectRatio>
              </Box>
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
                      size="sm"
                      variant="solid"
                      borderRadius="full"
                      border="none"
                    >
                      <Icon as={MdPlaylistAdd} boxSize={5} />
                      Add to playlist
                    </Button>
                  }
                />
                <Button
                  size="sm"
                  variant="solid"
                  borderRadius="full"
                  border="none"
                  _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
                  disabled={isSeedLimitReached}
                  onClick={onAddArtistToSeed}
                >
                  <Icon as={AiOutlineUserAdd} boxSize={4} />
                  Add artist as seed
                </Button>
              </Stack>
              <Box>
                <SpotifyTrackDetails id={track.id} />
              </Box>
            </Stack>
          )}
          {!track && trackQuery.isLoading && (
            <Stack gap={4}>
              <AspectRatio ratio={1}>
                <Skeleton w="100%" h="100%" />
              </AspectRatio>
              <Skeleton height="20px" w="80%" />
              <Skeleton height="16px" w="60%" />
            </Stack>
          )}
        </Box>

        <Box flex={1} minW={0} w="100%" css={scrollBarStyle}>
          {albumsQuery.isLoading ? (
            <Flex justify="center" py={8}>
              <Spinner />
            </Flex>
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
                  onTrackMouseEnter={onTrackMouseEnter}
                  onTrackMouseLeave={stopPreview}
                />
              ))}
            </Accordion.Root>
          )}
        </Box>
      </Flex>

      <VisuallyHidden>
        <audio ref={audioRef} preload="auto" playsInline loop />
      </VisuallyHidden>
    </Box>
  );
}

interface IAlbumAccordionItem {
  album: TSpotifyAlbum;
  playingTrackId: string | null;
  onTrackMouseEnter: (track: TSpotifyAlbumTrack) => void;
  onTrackMouseLeave: () => void;
}

function AlbumAccordionItem({
  album,
  playingTrackId,
  onTrackMouseEnter,
  onTrackMouseLeave,
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
            <Flex justify="center" py={4}>
              <Spinner size="sm" />
            </Flex>
          ) : (
            <Box>
              {tracks.map((track) => {
                const playable = Boolean(track.preview_url);
                const isActive = playingTrackId === track.id;
                return (
                  <Flex
                    key={track.id}
                    alignItems="center"
                    justifyContent="space-between"
                    py={2}
                    px={3}
                    borderRadius="sm"
                    bg={isActive ? "whiteAlpha.200" : "transparent"}
                    opacity={playable ? 1 : 0.5}
                    cursor={playable ? "pointer" : "default"}
                    transition="background 0.15s"
                    _hover={playable ? { bg: "whiteAlpha.100" } : undefined}
                    onMouseEnter={() =>
                      playable && onTrackMouseEnter(track)
                    }
                    onMouseLeave={onTrackMouseLeave}
                  >
                    <Flex gap={3} minW={0} flex={1} alignItems="center">
                      <Text
                        fontSize="sm"
                        color="gray.400"
                        w="24px"
                        textAlign="right"
                        flexShrink={0}
                      >
                        {track.track_number}
                      </Text>
                      <Text fontSize="sm" lineClamp={1}>
                        {track.name}
                      </Text>
                    </Flex>
                    <Text
                      fontSize="xs"
                      color="gray.400"
                      flexShrink={0}
                      ml={2}
                    >
                      {msToMinSec(track.duration_ms)}
                    </Text>
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
