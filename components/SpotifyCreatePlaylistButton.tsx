"use client";

import spotifyCreatePlaylist, {
  TSpotifyCreatePlaylistArgs,
} from "@/mutations/spotifyCreatePlaylistMutation";
import scrollBarStyle from "@/utils/scrollBarStyle";
import {
  Button,
  Box,
  Dialog,
  Portal,
  Input,
  InputGroup,
  Icon,
  useDisclosure,
} from "@chakra-ui/react";
import { FormEvent, useContext, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { SiApplemusic } from "react-icons/si";
import DialogCloseButton from "./DialogCloseButton";
import { SpotifyPlaylistsContext } from "./SpotifyPlaylistsProvider";

export default function SpotifyCreatePlaylistButton() {
  const dialog = useDisclosure();
  const [isSaving, setIsSaving] = useState(false);
  const initialRef = useRef<HTMLInputElement>(null);
  const [playlistName, setPlaylistName] = useState("");
  const { refetchPlaylists } = useContext(SpotifyPlaylistsContext) || {};

  const mutation = useMutation({
    mutationFn: ({ name }: TSpotifyCreatePlaylistArgs) =>
      spotifyCreatePlaylist({ name }),
    onSuccess: async () => {
      await refetchPlaylists?.();
      setIsSaving(false);
      dialog.onClose();
      setPlaylistName("");
    },
  });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate({ name: playlistName });
    setIsSaving(true);
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
          onClick={dialog.onOpen}
        >
          <Icon as={SiApplemusic} />
          Create Playlist
        </Button>
      </Box>
      <Dialog.Root
        open={dialog.open}
        onOpenChange={(e) => dialog.setOpen(e.open)}
        initialFocusEl={() => initialRef.current}
        scrollBehavior="inside"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Create Playlist</Dialog.Title>
              </Dialog.Header>
              <Dialog.CloseTrigger asChild>
                <DialogCloseButton />
              </Dialog.CloseTrigger>
              <form onSubmit={onSubmit}>
                <Dialog.Body css={scrollBarStyle}>
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
                </Dialog.Body>
                <Dialog.Footer>
                  <Button loading={isSaving} type="submit">
                    Create
                  </Button>
                </Dialog.Footer>
              </form>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
