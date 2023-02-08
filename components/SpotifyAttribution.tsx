"use client";

import { Box, BoxProps, HStack, Text } from "@chakra-ui/react";
import Image from "next/image";

export default function SpotifyAttribution(props: BoxProps) {
  return (
    <HStack mr={4} justifyContent="center" {...props}>
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
  );
}
