"use client";

import spotifyCreatePlaylist, {
  TSpotifyCreatePlaylistArgs,
} from "@/mutations/spotifyCreatePlaylistMutation";
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
  Icon,
} from "@chakra-ui/react";
import { FormEvent, useContext, useRef, useState } from "react";
import { useMutation } from "react-query";
import { SiApplemusic } from "react-icons/si";
import { SpotifyPlaylistsContext } from "./SpotifyPlaylistsProvider";

export default function SpotifyCreatePlaylistButton() {
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useBoolean();
  const [isSaving, setIsSaving] = useBoolean();
  const initialRef = useRef(null);
  const [playlistName, setPlaylistName] = useState("");
  const { refetchPlaylists } = useContext(SpotifyPlaylistsContext) || {};

  const mutation = useMutation(
    ({ name }: TSpotifyCreatePlaylistArgs) => spotifyCreatePlaylist({ name }),
    {
      onSuccess: async () => {
        await refetchPlaylists?.();
        setIsSaving.off();
        setIsCreatePlaylistOpen.off();
        setPlaylistName("");
      },
    }
  );

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate({ name: playlistName });
    setIsSaving.on();
  };

  return (
    <>
      <Box p={2}>
        <Button
          borderRadius="full"
          size="sm"
          variant="ghost"
          _hover={{
            bg: "whiteAlpha.300",
            color: "white",
          }}
          onClick={setIsCreatePlaylistOpen.on}
          leftIcon={<Icon as={SiApplemusic} />}
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
          <form onSubmit={onSubmit}>
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
              <Button isLoading={isSaving} colorScheme="purple" type="submit">
                Create
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}
