import spotifyAddTracksToPlaylist, {
  TSpotifyAddToPlaylistArgs,
} from "@/mutations/spotifyAddTracksToPlaylistMutation";
import { TSpotifyPlaylist } from "@/types/SpotifyPlaylist";
import { TSpotifyTrack } from "@/types/SpotifyTrack";
import scrollBarStyle from "@/utils/scrollBarStyle";
import {
  Box,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  Flex,
  AspectRatio,
  InputGroup,
  InputLeftElement,
  Icon,
  Input,
  ModalCloseButton,
  ModalBody,
  List,
  ModalFooter,
  Button,
  Text,
  ListItem,
  Spacer,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { BsCheck2 } from "react-icons/bs";
import { CgSearch } from "react-icons/cg";
import { useMutation } from "react-query";

interface ISpotifyAddTrackToPlaylistModal {
  isOpen: boolean;
  onClose: () => void;
  selectedTrack: TSpotifyTrack | null;
  playlists?: TSpotifyPlaylist[];
}

export default function SpotifyAddTrackToPlaylistModal({
  isOpen,
  onClose,
  selectedTrack,
  playlists,
}: ISpotifyAddTrackToPlaylistModal) {
  const [playlistFilter, setPlaylistFilter] = useState("");

  const onClosePlaylistModal = useCallback(() => {
    setPlaylistFilter("");
    onClose();
  }, [setPlaylistFilter, onClose]);

  const selectedTrackAlbumImageUrl = useMemo(
    () => selectedTrack?.album.images[0]?.url,
    [selectedTrack]
  );

  const filteredPlaylists = useMemo(() => {
    if (!playlists) return [];
    return playlists.filter((playlist: TSpotifyPlaylist) =>
      playlist.name.toLowerCase().includes(playlistFilter.toLowerCase())
    );
  }, [playlists, playlistFilter]);

  return (
    <Modal
      isOpen={isOpen}
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
          <Button w="100%" colorScheme="purple" onClick={onClosePlaylistModal}>
            Done
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
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
