"use client";

import spotifyCreatePlaylist, {
  TSpotifyCreatePlaylistArgs,
} from "@/mutations/SpotifyCreatePlaylist";
import scrollBarStyle from "@/utils/scrollBarStyle";
import {
  Button,
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useBoolean,
  InputGroup,
  Input,
} from "@chakra-ui/react";
import { useContext, useRef, useState } from "react";
import { useMutation } from "react-query";
import {
  SpotifyPlaylistsContext,
  TSpotifyPlaylistsContext,
} from "./SpotifyPlaylistsProvider";

export default function SpotifyCreatePlaylistButton() {
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useBoolean();
  const initialRef = useRef(null);
  const [playlistName, setPlaylistName] = useState("");
  const { refetchPlaylists } = useContext(SpotifyPlaylistsContext) || {};

  const mutation = useMutation(
    ({ name }: TSpotifyCreatePlaylistArgs) => spotifyCreatePlaylist({ name }),
    {
      onSuccess: () => {
        setIsCreatePlaylistOpen.off();
        setPlaylistName("");
        refetchPlaylists?.();
      },
    }
  );

  return (
    <>
      <Box p={2}>
        <Button
          w="100%"
          borderRadius="full"
          variant="outline"
          colorScheme="blue"
          _hover={{ bg: "blue.500", color: "white", borderColor: "blue.900" }}
          onClick={setIsCreatePlaylistOpen.on}
        >
          Create Playlist
        </Button>
      </Box>
      <Modal
        initialFocusRef={initialRef}
        isOpen={isCreatePlaylistOpen}
        onClose={setIsCreatePlaylistOpen.off}
        scrollBehavior="inside"
        variant="spotifyModal"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Playlist</ModalHeader>
          <ModalCloseButton />
          <ModalBody sx={scrollBarStyle}>
            <Box p={2} px={6}>
              <InputGroup>
                <Input
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  ref={initialRef}
                  placeholder="Playlist Name"
                />
              </InputGroup>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button
              isLoading={mutation.isLoading}
              colorScheme="blue"
              onClick={() => {
                mutation.mutate({ name: playlistName });
              }}
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}