"use client";

import spotifyAddTracksToPlaylist, {
  TSpotifyAddToPlaylistArgs,
} from "@/mutations/spotifyAddTracksToPlaylistMutation";
import { TSpotifyPlaylist } from "@/types/SpotifyPlaylist";
import { TSpotifyTrack } from "@/types/SpotifyTrack";
import scrollBarStyle from "@/utils/scrollBarStyle";
import { toaster } from "@/utils/toaster";
import { Box, List, Skeleton, Text } from "@chakra-ui/react";
import { useContext } from "react";
import { useDrop } from "react-dnd";
import { useMutation } from "@tanstack/react-query";
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
        css={scrollBarStyle}
      >
        <List.Root listStyle="none">
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
        </List.Root>
      </Box>
    </>
  );
}

function PlaylistItem({ playlist }: { playlist: TSpotifyPlaylist }) {
  const mutation = useMutation({
    mutationFn: ({ playlistId, tracks }: TSpotifyAddToPlaylistArgs) =>
      spotifyAddTracksToPlaylist({ playlistId, tracks }),
    onSuccess: () => {
      toaster.create({
        title: "Track added to playlist",
        type: "success",
        duration: 3000,
      });
    },
  });

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
    <List.Item
      ref={dropRef as unknown as React.Ref<HTMLLIElement>}
      px={4}
      css={{
        "& .spotify-playlist-list-item": {
          color: isOver ? "whiteAlpha.900" : undefined,
        },
        "&:hover .spotify-playlist-list-item": {
          color: "whiteAlpha.900",
        },
      }}
    >
      <Text
        fontSize="small"
        lineClamp={1}
        color="whiteAlpha.500"
        className="spotify-playlist-list-item"
      >
        {playlist.name}
      </Text>
    </List.Item>
  );
}

function ListItemPlaceholder() {
  return (
    <List.Item px={2} my={2} opacity={0.2}>
      <Skeleton borderRadius="full" height="20px" />
    </List.Item>
  );
}
