"use client";

import scrollBarStyle from "@/utils/scrollBarStyle";
import { Box, List, ListItem, Skeleton, Text } from "@chakra-ui/react";
import { useContext } from "react";
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
              <ListItem px={4} key={playlist.id}>
                <Text fontSize="small" noOfLines={1} color="whiteAlpha.800">
                  {playlist.name}
                </Text>
              </ListItem>
            ))
          )}
        </List>
      </Box>
    </>
  );
}

function ListItemPlaceholder() {
  return (
    <ListItem px={2} my={2} opacity={0.2}>
      <Skeleton borderRadius="full" height="20px" />
    </ListItem>
  );
}
