"use client";

import { Box, Flex } from "@chakra-ui/react";
import SpotifyAutocomplete from "./SpotifyAutocomplete";
import SpotifyTopNavDiscoPattern from "./SpotifyTopNavDiscoPattern";

export default function SpotifySeedControls() {
  return (
    <Box position="relative" overflow="visible" w="100%" zIndex="dropdown">
      <SpotifyTopNavDiscoPattern rows={4} />
      <Flex px={2} position="relative" zIndex={1}>
        <SpotifyAutocomplete />
      </Flex>
    </Box>
  );
}
