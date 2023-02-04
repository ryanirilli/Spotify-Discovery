"use client";

import { Flex, HStack } from "@chakra-ui/react";
import SpotifyAutocomplete from "./SpotifyAutocomplete";
import SpotifyGenres from "./SpotifyGenres";
import SpotifyUserInfo from "./SpotifyUserInfo";

export default function SpotifyFilters() {
  return (
    <Flex>
      <HStack px={2} flex={1}>
        <SpotifyAutocomplete />
        <SpotifyGenres />
      </HStack>
      <SpotifyUserInfo />
    </Flex>
  );
}
