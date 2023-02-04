"use client";

import spotifyUserPlaylists from "@/queries/spotifyUserPlaylists";
import scrollBarStyle from "@/utils/scrollBarStyle";
import { Box, List, ListItem, Text } from "@chakra-ui/react";
import { useQuery } from "react-query";

export default function SpotifyPlaylists() {
  const { data } = useQuery("userPlaylists", spotifyUserPlaylists);

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
          {data?.map((playlist) => (
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
