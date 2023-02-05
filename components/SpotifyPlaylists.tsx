"use client";

import scrollBarStyle from "@/utils/scrollBarStyle";
import { Box, List, ListItem, Text } from "@chakra-ui/react";
import { useContext } from "react";
import { SpotifyPlaylistsContext } from "./SpotifyPlaylistsProvider";

export default function SpotifyPlaylists() {
  const { playlists } = useContext(SpotifyPlaylistsContext) || {};
  return (
    <>
      <Text px={2} fontWeight="bold">
        Playlists
      </Text>
      <Box
        maxH="50vh"
        overflowY="scroll"
        bg="blackAlpha.500"
        sx={scrollBarStyle}
      >
        <List>
          {playlists?.map((playlist) => (
            <ListItem px={2} key={playlist.id}>
              <Text fontSize="small" noOfLines={1} color="whiteAlpha.800">
                {playlist.name}
              </Text>
            </ListItem>
          ))}
        </List>
      </Box>
    </>
  );
}
