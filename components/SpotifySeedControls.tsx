"use client";

import { Box, Flex } from "@chakra-ui/react";
import SpotifyAutocomplete from "./SpotifyAutocomplete";
import SpotifyTopNavDiscoPattern from "./SpotifyTopNavDiscoPattern";

export default function SpotifySeedControls() {
  return (
    <Box position="relative" overflow="hidden" w="100%">
      <SpotifyTopNavDiscoPattern rows={4} />
      <Flex px={2} position="relative" zIndex={1}>
        <SpotifyAutocomplete />
      </Flex>
    </Box>
  );
}
