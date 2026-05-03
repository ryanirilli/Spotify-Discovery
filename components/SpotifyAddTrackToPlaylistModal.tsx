import spotifyAddTracksToPlaylist, {
  TSpotifyAddToPlaylistArgs,
} from "@/mutations/spotifyAddTracksToPlaylistMutation";
import { TSpotifyPlaylist } from "@/types/SpotifyPlaylist";
import { TSpotifyTrack } from "@/types/SpotifyTrack";
import scrollBarStyle from "@/utils/scrollBarStyle";
import { toaster } from "@/utils/toaster";
import {
  Box,
  Image,
  Dialog,
  Portal,
  Flex,
  AspectRatio,
  InputGroup,
  Icon,
  Input,
  List,
  Text,
  Spacer,
} from "@chakra-ui/react";
import DialogCloseButton from "./DialogCloseButton";
import { Button } from "@/components/ui/Button";
import { useCallback, useMemo, useState } from "react";
import { BsCheck2 } from "react-icons/bs";
import { CgSearch } from "react-icons/cg";
import { useMutation } from "@tanstack/react-query";
import SpotifyLink from "./SpotifyLink";

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
    <Dialog.Root
      open={isOpen}
      onOpenChange={(e) => !e.open && onClosePlaylistModal()}
      scrollBehavior="inside"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title textStyle="dialogTitle">Add To Playlist</Dialog.Title>
              <Flex
                color="white"
                bg="black"
                border="1px solid"
                borderColor="whiteAlpha.300"
                borderRightRadius="md"
                overflow="hidden"
                my={2}
              >
                <Box maxW={16} flex={1}>
                  <AspectRatio ratio={1} overflow="hidden">
                    {selectedTrackAlbumImageUrl ? (
                      <Image
                        alt="selected track album art"
                        src={selectedTrackAlbumImageUrl}
                      />
                    ) : (
                      <Box />
                    )}
                  </AspectRatio>
                </Box>
                <Box p={2} flex={1}>
                  {selectedTrack && (
                    <>
                      <SpotifyLink isExternal rec={selectedTrack}>
                        <Text textStyle="itemTitle" lineClamp={1}>
                          {selectedTrack?.name}
                        </Text>
                      </SpotifyLink>
                      <SpotifyLink isExternal rec={selectedTrack}>
                        <Text
                          textStyle="itemMeta"
                          lineClamp={1}
                          transform="translateY(-3px)"
                        >
                          {selectedTrack?.artists
                            .map((a) => a.name)
                            .join(", ")}
                        </Text>
                      </SpotifyLink>
                    </>
                  )}
                </Box>
                <Image
                  height="100%"
                  alt="spotify logo"
                  src="Spotify_Logo_RGB_White.png"
                  maxW="64px"
                  mr={2}
                  mt={2}
                />
              </Flex>
              <InputGroup
                mt={4}
                startElement={<Icon as={CgSearch} color="gray.500" />}
              >
                <Input
                  placeholder="Find a playlist"
                  textStyle="body"
                  value={playlistFilter}
                  onChange={(e) => setPlaylistFilter(e.target.value)}
                />
              </InputGroup>
            </Dialog.Header>
            <Dialog.CloseTrigger asChild>
              <DialogCloseButton />
            </Dialog.CloseTrigger>
            <Dialog.Body css={scrollBarStyle}>
              <List.Root listStyle="none">
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
              </List.Root>
            </Dialog.Body>
            <Dialog.Footer>
              <Button visual="primary" w="100%" onClick={onClosePlaylistModal}>
                Done
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
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
  const mutation = useMutation({
    mutationFn: ({ playlistId, tracks }: TSpotifyAddToPlaylistArgs) =>
      spotifyAddTracksToPlaylist({ playlistId, tracks }),
    onSuccess: () => {
      onSuccess();
      toaster.create({
        title: "Track added to playlist",
        type: "success",
        duration: 3000,
      });
    },
  });

  return (
    <List.Item
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
        <Text
          textStyle="itemTitle"
          opacity={mutation.isSuccess ? 0.4 : 1}
          textTransform="capitalize"
        >
          {playlist.name}
        </Text>
        <Spacer />
        {!mutation.isSuccess ? (
          <Button
            visual="secondary"
            size="sm"
            disabled={mutation.isPending || mutation.isSuccess}
          >
            {mutation.isPending ? "Adding..." : "Add"}
          </Button>
        ) : (
          <Icon mr={4} as={BsCheck2} color="green.500" />
        )}
      </Flex>
    </List.Item>
  );
}
