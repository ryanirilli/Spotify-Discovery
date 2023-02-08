"use client";

import { Box, Flex } from "@chakra-ui/react";
import SpotifyCreatePlaylistButton from "./SpotifyCreatePlaylistButton";
import SpotifyPlaylists from "./SpotifyPlaylists";
import SpotifyUserInfo from "./SpotifyUserInfo";

export default function SpotifyLeftSidebar() {
  return (
    <Flex direction="column" h="100%">
      <Box flex={1}>
        <SpotifyPlaylists />
        <SpotifyCreatePlaylistButton />
      </Box>
      <Box p={4}>
        <SpotifyUserInfo />
      </Box>
    </Flex>
  );
}
