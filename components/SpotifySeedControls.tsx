"use client";

import { Box, Flex, HStack, Text } from "@chakra-ui/react";
import Image from "next/image";
import SpotifyAutocomplete from "./SpotifyAutocomplete";
import SpotifyGenres from "./SpotifyGenres";

export default function SpotifyFilters() {
  return (
    <Flex>
      <HStack px={2} flex={1}>
        <SpotifyAutocomplete />
        <SpotifyGenres />
      </HStack>
      <HStack mr={4} justifyContent="center">
        <Text fontSize="xs" color="whiteAlpha.500">
          Powered by
        </Text>
        <Box maxW="75px">
          <Image
            src="/Spotify_Logo_RGB_Green.png"
            width={2362}
            height={709}
            alt="Spotify Logo"
          />
        </Box>
      </HStack>
    </Flex>
  );
}
