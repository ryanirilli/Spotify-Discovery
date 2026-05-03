"use client";

import { Flex } from "@chakra-ui/react";
import SpotifyAutocomplete from "./SpotifyAutocomplete";

export default function SpotifySeedControls() {
  return (
    <Flex px={2}>
      <SpotifyAutocomplete />
    </Flex>
  );
}
