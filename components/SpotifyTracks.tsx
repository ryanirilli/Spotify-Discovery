"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { CgSearch } from "react-icons/cg";
import { BsCheck2 } from "react-icons/bs";
import { MdExpandMore, MdPlaylistAdd } from "react-icons/md";
import { BiBarChartAlt2 } from "react-icons/bi";
import { RiAlbumLine, RiSpotifyFill } from "react-icons/ri";
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
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  List,
  ListItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Progress,
  Spacer,
  Text,
  Tooltip,
  useBoolean,
  useBreakpointValue,
  useToast,
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
import { TSpotifyPlaylist } from "@/types/SpotifyPlaylist";
import { SpotifyPlaylistsContext } from "./SpotifyPlaylistsProvider";
import scrollBarStyle from "@/utils/scrollBarStyle";
import { useMutation } from "react-query";
import spotifyAddTracksToPlaylist, {
  TSpotifyAddToPlaylistArgs,
} from "@/mutations/spotifyAddTracksToPlaylistMutation";
import animationData from "@/public/sound-bars.json";
import Lottie from "@/components/Lottie";
import SpotifyTrackDetails from "./SpotifyTrackDetails";
import { DragPreviewImage, useDrag } from "react-dnd";
import LazyImage from "./LazyImage";

const lottiePlayerOptions = { animationData };

export default function SpotifyTracks() {
  const { recommendations } = useContext(
    SpotifyRecommendationsContext
  ) as TSpotifyRecommendationsContext;

  const { playlists } = useContext(SpotifyPlaylistsContext) || {};
  const [playlistFilter, setPlaylistFilter] = useState("");
  const [isShowingPlaylistsModal, setIsShowingPlaylistsModal] = useBoolean();

  const filteredPlaylists =
    playlists?.filter((playlist: TSpotifyPlaylist) =>
      playlist.name.toLowerCase().includes(playlistFilter.toLowerCase())
    ) || [];

  const [selectedTrack, setSelectedTrack] = useState<TSpotifyTrack | null>(
    null
  );

  const onAddTrackToPlaylist = (track: TSpotifyTrack) => {
    setSelectedTrack(track);
    setIsShowingPlaylistsModal.on();
  };

  const onClosePlaylistModal = () => {
    setPlaylistFilter("");
    setSelectedTrack(null);
    setIsShowingPlaylistsModal.off();
  };

  const selectedTrackAlbumImageUrl = selectedTrack?.album.images[0]?.url;

  return (
    <>
      <Wrap spacing={0} pt={4} px={4} pb={32}>
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
      <Modal
        isOpen={isShowingPlaylistsModal}
        onClose={onClosePlaylistModal}
        scrollBehavior="inside"
        variant="spotifyModal"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Add To Playlist
            <Flex
              color="white"
              bg="black"
              borderRadius="md"
              overflow="hidden"
              my={2}
            >
              <Box flex={1} maxW={16}>
                <AspectRatio ratio={1} overflow="hidden">
                  {selectedTrackAlbumImageUrl && (
                    <Image
                      boxSize="cover"
                      alt="selected track album art"
                      src={selectedTrackAlbumImageUrl}
                    />
                  )}
                </AspectRatio>
              </Box>
              <Box p={2}>
                <Text fontWeight="bold" fontSize="small" noOfLines={1}>
                  {selectedTrack?.name}
                </Text>
                <Text
                  fontWeight="normal"
                  fontSize="small"
                  noOfLines={1}
                  transform="translateY(-3px)"
                >
                  {selectedTrack?.artists.map((a) => a.name).join(", ")}
                </Text>
              </Box>
            </Flex>
            <InputGroup mt={4}>
              <InputLeftElement
                pointerEvents="none"
                children={<Icon as={CgSearch} color="gray.500" />}
              />
              <Input
                placeholder="Find a playlist"
                value={playlistFilter}
                onChange={(e) => setPlaylistFilter(e.target.value)}
              />
            </InputGroup>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody sx={scrollBarStyle}>
            <List>
              {filteredPlaylists.map((playlist: TSpotifyPlaylist) => {
                return (
                  <SpotifyPlaylistListItem
                    onSuccess={onClosePlaylistModal}
                    key={playlist.id}
                    playlist={playlist}
                    selectedTrack={selectedTrack}
                  />
                );
              })}
            </List>
          </ModalBody>
          <ModalFooter>
            <Button
              w="100%"
              colorScheme="purple"
              onClick={onClosePlaylistModal}
            >
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
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

  const onAddTrackToSeed = () => {};

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

          <Box
            pointerEvents="none"
            position={"absolute"}
            transition="bottom 0.3s ease-in-out"
            bottom={isPlaying ? 0 : "-100%"}
            left={0}
            w="100%"
            bgGradient="linear(to-t, blackAlpha.500, transparent)"
          >
            <Box maxW="40px">
              {isPlaying && (
                <Lottie lottiePlayerOptions={lottiePlayerOptions} />
              )}
            </Box>
          </Box>
        </Box>
        <VisuallyHidden>
          <audio src={rec.preview_url} ref={previewRef} loop />
        </VisuallyHidden>
        <Progress h={2} value={trackProgress} />
        <Box bg="white" alignItems="center" borderBottomRadius="md">
          <Flex p={2}>
            <Box flex={1}>
              <Text fontWeight="bold" fontSize="small" noOfLines={1}>
                {isLoadingRecs ? (
                  "..."
                ) : (
                  <Link isExternal href={rec.external_urls.spotify}>
                    {rec.name}
                  </Link>
                )}
              </Text>
              <Text fontSize="small" noOfLines={1} color="gray.500">
                {isLoadingRecs ? (
                  "..."
                ) : (
                  <Link isExternal href={rec.artists[0].external_urls.spotify}>
                    {rec.artists.map((a) => a.name).join(", ")}
                  </Link>
                )}
              </Text>
            </Box>
            <Icon boxSize="6" as={RiSpotifyFill} />
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

interface ISpotifyPlaylistListItem {
  playlist: TSpotifyPlaylist;
  selectedTrack: TSpotifyTrack | null;
  onSuccess: () => void;
}

function SpotifyPlaylistListItem({
  playlist,
  selectedTrack,
  onSuccess,
}: ISpotifyPlaylistListItem) {
  const toast = useToast();
  const mutation = useMutation(
    ({ playlistId, tracks }: TSpotifyAddToPlaylistArgs) =>
      spotifyAddTracksToPlaylist({ playlistId, tracks }),
    {
      onSuccess: () => {
        onSuccess();
        toast({
          title: "Track added to playlist",
          status: "success",
          duration: 3000,
          isClosable: false,
          position: "top",
        });
      },
    }
  );

  return (
    <ListItem
      _hover={{ bg: "black" }}
      px={4}
      py={2}
      cursor="pointer"
      role="button"
      onClick={() => {
        if (mutation.isSuccess) {
          return;
        }
        mutation.mutate({
          playlistId: playlist.id,
          tracks: [selectedTrack?.uri || ""],
        });
      }}
    >
      <Flex alignItems="center">
        <Text opacity={mutation.isSuccess ? 0.4 : 1} textTransform="capitalize">
          {playlist.name}
        </Text>
        <Spacer />
        {!mutation.isSuccess ? (
          <Button
            disabled={mutation.isLoading || mutation.isSuccess}
            isLoading={mutation.isLoading}
            colorScheme="blackAlpha"
            size="sm"
          >
            Add
          </Button>
        ) : (
          <Icon mr={4} as={BsCheck2} color="green.500" />
        )}
      </Flex>
    </ListItem>
  );
}
