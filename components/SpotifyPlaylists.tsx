"use client";

import spotifyAddTracksToPlaylist, {
  TSpotifyAddToPlaylistArgs,
} from "@/mutations/spotifyAddTracksToPlaylistMutation";
import { TSpotifyPlaylist } from "@/types/SpotifyPlaylist";
import { TSpotifyTrack } from "@/types/SpotifyTrack";
import scrollBarStyle from "@/utils/scrollBarStyle";
import {
  Box,
  List,
  ListItem,
  Skeleton,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useContext } from "react";
import { useDrop } from "react-dnd";
import { useMutation } from "react-query";
import { SpotifyPlaylistsContext } from "./SpotifyPlaylistsProvider";

export default function SpotifyPlaylists() {
  const { playlists, isLoading } = useContext(SpotifyPlaylistsContext) || {};
  return (
    <>
      <Text pl={4} mt={4} mb={2} fontWeight="bold">
        Playlists
      </Text>
      <Box
        maxH="50vh"
        overflowY="scroll"
        bg="blackAlpha.500"
        sx={scrollBarStyle}
      >
        <List>
          {isLoading ? (
            <>
              <ListItemPlaceholder />
              <ListItemPlaceholder />
              <ListItemPlaceholder />
              <ListItemPlaceholder />
              <ListItemPlaceholder />
              <ListItemPlaceholder />
              <ListItemPlaceholder />
              <ListItemPlaceholder />
              <ListItemPlaceholder />
            </>
          ) : (
            playlists?.map((playlist) => (
              <PlaylistItem key={playlist.id} playlist={playlist} />
            ))
          )}
        </List>
      </Box>
    </>
  );
}

function PlaylistItem({ playlist }: { playlist: TSpotifyPlaylist }) {
  const toast = useToast();
  const mutation = useMutation(
    ({ playlistId, tracks }: TSpotifyAddToPlaylistArgs) =>
      spotifyAddTracksToPlaylist({ playlistId, tracks }),
    {
      onSuccess: () => {
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

  const [{ isOver }, dropRef] = useDrop(
    () => ({
      accept: "SpotifyTrack",
      drop(track: TSpotifyTrack) {
        mutation.mutate({ playlistId: playlist.id, tracks: [track.uri] });
      },
      collect: (monitor) => ({
        isOver: Boolean(monitor.isOver()),
      }),
    }),
    [playlist, mutation]
  );
  return (
    <ListItem
      ref={dropRef}
      px={4}
      sx={{
        "& .spotify-playlist-list-item": {
          color: isOver && "whiteAlpha.900",
        },
        "&:hover .spotify-playlist-list-item": {
          color: "whiteAlpha.900",
        },
      }}
    >
      <Text
        fontSize="small"
        noOfLines={1}
        color="whiteAlpha.500"
        className="spotify-playlist-list-item"
      >
        {playlist.name}
      </Text>
    </ListItem>
  );
}

function ListItemPlaceholder() {
  return (
    <ListItem px={2} my={2} opacity={0.2}>
      <Skeleton borderRadius="full" height="20px" />
    </ListItem>
  );
}
