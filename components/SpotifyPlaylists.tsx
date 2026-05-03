"use client";

import spotifyAddTracksToPlaylist, {
  TSpotifyAddToPlaylistArgs,
} from "@/mutations/spotifyAddTracksToPlaylistMutation";
import { TSpotifyPlaylist } from "@/types/SpotifyPlaylist";
import { TSpotifyTrack } from "@/types/SpotifyTrack";
import { toaster } from "@/utils/toaster";
import { Box, Flex, Icon, List, Text } from "@chakra-ui/react";
import { useContext } from "react";
import { useDrop } from "react-dnd";
import { useMutation } from "@tanstack/react-query";
import { TbLayoutSidebarLeftCollapse, TbPlaylist } from "react-icons/tb";
import { SidebarCollapseContext } from "./DesktopAppLayout";
import { LoadingTextRows } from "./LoadingSkeleton";
import { SpotifyPlaylistsContext } from "./SpotifyPlaylistsProvider";

const ICON_SIZE_PX = 18;
const ICON_SLIDE_TRANSITION = "transform 220ms ease";

export default function SpotifyPlaylists() {
  const { playlists, isLoading } = useContext(SpotifyPlaylistsContext) || {};
  const { toggleSidebar } = useContext(SidebarCollapseContext);
  return (
    <>
      <Flex
        as="button"
        onClick={toggleSidebar}
        aria-label="Collapse sidebar"
        pl={4}
        pr={2}
        mt={4}
        mb={2}
        alignItems="center"
        gap={2}
        cursor="pointer"
        color="whiteAlpha.900"
        textAlign="left"
        css={{
          [`&:hover .sidebar-toggle-icons`]: {
            transform: `translateY(-${ICON_SIZE_PX}px)`,
          },
        }}
      >
        <Box
          position="relative"
          overflow="hidden"
          w={`${ICON_SIZE_PX}px`}
          h={`${ICON_SIZE_PX}px`}
          flexShrink={0}
        >
          <Box
            className="sidebar-toggle-icons"
            transition={ICON_SLIDE_TRANSITION}
          >
            <Icon
              as={TbPlaylist}
              display="block"
              w={`${ICON_SIZE_PX}px`}
              h={`${ICON_SIZE_PX}px`}
            />
            <Icon
              as={TbLayoutSidebarLeftCollapse}
              display="block"
              w={`${ICON_SIZE_PX}px`}
              h={`${ICON_SIZE_PX}px`}
            />
          </Box>
        </Box>
        <Text fontWeight="bold">Playlists</Text>
      </Flex>
      <Box bg="blackAlpha.500">
        {isLoading ? (
          <LoadingTextRows count={9} />
        ) : (
          <List.Root listStyle="none">
            {playlists?.map((playlist) => (
              <PlaylistItem key={playlist.id} playlist={playlist} />
            ))}
          </List.Root>
        )}
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
