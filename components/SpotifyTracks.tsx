"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { MdExpandMore, MdPlaylistAdd } from "react-icons/md";
import { BiBarChartAlt2 } from "react-icons/bi";
import { RiSpotifyFill } from "react-icons/ri";
import { AiOutlineUserAdd } from "react-icons/ai";
import {
  AspectRatio,
  Box,
  Button,
  Card,
  Flex,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Progress,
  Text,
  Tooltip,
  useBoolean,
  useBreakpointValue,
  VisuallyHidden,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import {
  SpotifyRecommendationsContext,
  TSpotifyRecommendationsContext,
} from "./SpotifyRecommendationsProvider";
import { TSpotifyTrack } from "@/types/SpotifyTrack";
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
  const { recommendations } = useContext(
    SpotifyRecommendationsContext
  ) as TSpotifyRecommendationsContext;

  const { playlists } = useContext(SpotifyPlaylistsContext) || {};

  const [selectedTrack, setSelectedTrack] = useState<TSpotifyTrack | null>(
    null
  );

  const [isShowingPlaylistsModal, setIsShowingPlaylistsModal] = useBoolean();

  const onAddTrackToPlaylist = useCallback(
    (track: TSpotifyTrack) => {
      setSelectedTrack(track);
      setIsShowingPlaylistsModal.on();
    },
    [setSelectedTrack, setIsShowingPlaylistsModal]
  );

  const onClose = useCallback(() => {
    setSelectedTrack(null);
    setIsShowingPlaylistsModal.off();
  }, [setSelectedTrack, setIsShowingPlaylistsModal]);

  return (
    <>
      <Wrap spacing={0} px={4} pb={32}>
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
        isOpen={isShowingPlaylistsModal}
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
  const { isSeedLimitReached, addArtist, fetchRecs, isLoadingRecs } =
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

  const animateTrackProgress = () => {
    if (previewRef.current !== null && !previewRef.current.paused) {
      const { currentTime, duration } = previewRef.current;
      let progress = (currentTime / duration) * 100;
      setTrackProgress(progress);
      requestAnimationFrame(animateTrackProgress);
    }
  };

  const playTrack = () => {
    previewRef.current?.play();
    setIsPlaying(true);
    animateTrackProgress();
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

  const isTouchDevice = window.ontouchstart !== undefined;
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
    let artist;
    try {
      const res = await fetch(
        `/api/spotify-get-artist-details?artistId=${rec.artists[0].id}`
      );
      artist = await res.json();
    } catch (error) {
      console.error(error);
    }
    artist && addArtist(artist);
    setTimeout(() => fetchRecs(), 0);
  };

  return (
    <>
      <DragPreviewImage
        connect={dragPreviewRef}
        src="/spotify-track-drag-image.svg"
      />
      <Card
        ref={dragRef}
        m={2}
        mb={[8, 2]}
        w="100%"
        bg="black"
        _hover={{ boxShadow: "outline" }}
        onMouseEnter={() => setCurTrack?.(rec.id)}
        onClick={() => setCurTrack?.(rec.id)}
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
            <Icon mr={1} mt={1} boxSize="6" as={RiSpotifyFill} />
          </Flex>
        </Box>
        <VisuallyHidden>
          <audio src={rec.preview_url} ref={previewRef} loop />
        </VisuallyHidden>
        <Progress variant="spotify" h={2} value={trackProgress} />
        <Box bg="white" alignItems="center" borderBottomRadius="md">
          <Flex p={2}>
            <Box flex={1}>
              <Text fontWeight="bold" fontSize="small" noOfLines={1}>
                {isLoadingRecs ? (
                  "..."
                ) : (
                  <SpotifyLink isExternal rec={rec}>
                    {rec.name}
                  </SpotifyLink>
                )}
              </Text>
              <Text fontSize="small" noOfLines={1} color="gray.500">
                {isLoadingRecs ? (
                  "..."
                ) : (
                  <SpotifyLink isExternal rec={rec}>
                    {rec.artists.map((a) => a.name).join(", ")}
                  </SpotifyLink>
                )}
              </Text>
            </Box>
          </Flex>
          <Flex>
            <Popover isLazy flip={shouldFlipPopover} placement="top-start">
              {({ isOpen, onClose }) => {
                if (curTrack !== rec.id && isOpen) {
                  onClose();
                }
                return (
                  <>
                    <PopoverTrigger>
                      <Flex flex="1">
                        <Tooltip hasArrow label="Track details" openDelay={500}>
                          <IconButton
                            variant="outline"
                            size="sm"
                            aria-label="Track details"
                            icon={<Icon boxSize={4} as={BiBarChartAlt2} />}
                            borderRadius={0}
                            flex={1}
                            borderRight="none"
                            borderBottom="none"
                            borderLeft="none"
                          />
                        </Tooltip>
                      </Flex>
                    </PopoverTrigger>
                    <PopoverContent boxShadow="dark-lg">
                      <PopoverArrow />
                      <PopoverBody p={0}>
                        <SpotifyTrackDetails id={rec.id} />
                        <Box p={2}>
                          <Button
                            colorScheme="purple"
                            size="sm"
                            w="100%"
                            onClick={onClose}
                          >
                            Done
                          </Button>
                        </Box>
                      </PopoverBody>
                    </PopoverContent>
                  </>
                );
              }}
            </Popover>
            <Tooltip hasArrow label="Add to playlist" openDelay={500}>
              <IconButton
                aria-label="Add to playlist database"
                icon={<Icon boxSize={6} as={MdPlaylistAdd} />}
                variant="outline"
                size="sm"
                borderRadius={0}
                flex={1}
                onClick={() => onAddTrackToPlaylist(rec)}
                borderBottom="none"
                borderRight="none"
              />
            </Tooltip>
            <Menu>
              <Tooltip hasArrow label="More options" openDelay={500}>
                <MenuButton
                  isDisabled={isSeedLimitReached}
                  as={IconButton}
                  aria-label="Add track or artist"
                  icon={<Icon boxSize={6} as={MdExpandMore} />}
                  variant="outline"
                  size="sm"
                  borderRadius={0}
                  flex={1}
                  borderBottom="none"
                  borderRight="none"
                />
              </Tooltip>
              <MenuList>
                {/* <MenuItem
                  onClick={() => onAddTrackToSeed()}
                  icon={
                    <Icon
                      boxSize={6}
                      as={RiAlbumLine}
                      transform="translateY(2px)"
                    />
                  }
                >
                  Add track as seed
                </MenuItem> */}
                <MenuItem
                  onClick={() => onAddArtistToSeed()}
                  icon={
                    <Icon
                      boxSize={6}
                      as={AiOutlineUserAdd}
                      transform="translateY(2px)"
                    />
                  }
                >
                  Add artist as seed
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Box>
      </Card>
    </>
  );
}
