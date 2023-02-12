"use client";

import { Box, BoxProps, HStack, Text, Image } from "@chakra-ui/react";

export default function SpotifyAttribution(props: BoxProps) {
  return (
    <HStack mr={4} justifyContent="center" {...props}>
      <Text fontSize="xs" color="whiteAlpha.500">
        Powered by
      </Text>
      <Box maxW="75px">
        <Image src="/Spotify_Logo_RGB_Green.png" w="200px" alt="Spotify Logo" />
      </Box>
    </HStack>
  );
}
