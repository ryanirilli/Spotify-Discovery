"use client";

import { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CgMoreVerticalAlt, CgSearch } from "react-icons/cg";
import { BsCheck2 } from "react-icons/bs";
import {
  AspectRatio,
  Box,
  Button,
  Card,
  Flex,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
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
  Progress,
  Spacer,
  Text,
  useBoolean,
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
            w={["100%", "50%", "25%", null, "16.66%"]}
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
                      fill
                      sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              33vw"
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
  const { curTrack, setCurTrack } =
    useContext<TSpotifyCurrentTrackContext | null>(
      SpotifyCurrentTrackContext
    ) || {};
  const previewRef = useRef<HTMLAudioElement>(null);
  const onMouseEnterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [trackProgress, setTrackProgress] = useState(0);
  const [isAlbumArtLoaded, setIsAlbumArtLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const animateTrackProgress = () => {
    if (previewRef.current !== null && !previewRef.current.paused) {
      const { currentTime, duration } = previewRef.current;
      let progress = (currentTime / duration) * 100;
      if (progress === 100) {
        progress = 0;
        previewRef.current.currentTime = 0;
      }
      setTrackProgress(progress);
      requestAnimationFrame(animateTrackProgress);
    }
  };

  const playTrack = () => {
    setCurTrack?.(rec.id);
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

  useEffect(() => {
    if (
      previewRef.current &&
      !previewRef.current.paused &&
      curTrack !== rec.id
    ) {
      pauseTrack();
    }
  }, [curTrack, rec]);

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

  return (
    <Card
      m={2}
      mb={[8, 2]}
      w="100%"
      bg="black"
      _hover={{ boxShadow: "outline" }}
    >
      <Box position="relative" overflow="hidden">
        <AspectRatio
          ratio={1}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={toggleTrack}
          transition="opacity 0.3s ease-in-out"
          opacity={isAlbumArtLoaded ? 1 : 0}
          overflow="hidden"
        >
          <Box>
            {albumImageUrl && (
              <Image
                fill
                sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              33vw"
                alt="album art"
                src={albumImageUrl}
                onLoadingComplete={() => setIsAlbumArtLoaded(true)}
              />
            )}
          </Box>
        </AspectRatio>

        <Box
          position={"absolute"}
          transition="bottom 0.3s ease-in-out"
          bottom={isPlaying ? 0 : "-100%"}
          left={0}
          w="100%"
          bgGradient="linear(to-t, blackAlpha.900, transparent)"
        >
          <Box maxW="40px">
            {isPlaying && <Lottie lottiePlayerOptions={lottiePlayerOptions} />}
          </Box>
        </Box>
      </Box>
      <VisuallyHidden>
        <audio src={rec.preview_url} ref={previewRef} />
      </VisuallyHidden>
      <Progress h={2} value={trackProgress} />
      <Flex px={2} bg="white" alignItems="center" borderBottomRadius="md">
        <Box flex={1}>
          <Text fontWeight="bold" fontSize="small" noOfLines={1}>
            {rec.name}
          </Text>
          <Text fontSize="small" noOfLines={1} transform="translateY(-3px)">
            {rec.artists.map((a) => a.name).join(", ")}
          </Text>
        </Box>
        <Box py={2} pl={1}>
          <Menu>
            <MenuButton
              as={IconButton}
              size="sm"
              aria-label="Options"
              icon={<Icon as={CgMoreVerticalAlt} />}
              variant="outline"
            />
            <MenuList boxShadow="dark-lg">
              <MenuItem onClick={() => onAddTrackToPlaylist(rec)}>
                Add To Playlist
              </MenuItem>
              <MenuItem command="coming soon">Track Details</MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Flex>
    </Card>
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
          isClosable: true,
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
