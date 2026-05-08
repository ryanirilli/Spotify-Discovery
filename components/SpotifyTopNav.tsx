"use client";

import NextLink from "next/link";
import { Box, Image, Link } from "@chakra-ui/react";

interface ISpotifyTopNav {
  children: React.ReactNode;
}

export default function SpotifyTopNav({ children }: ISpotifyTopNav) {
  return (
    <Box
      pt={2}
      pb={2}
      borderBottom={["none", "1px"]}
      borderColor="whiteAlpha.300"
      position="relative"
    >
      {children}
      <Link
        as={NextLink}
        href="/home"
        aria-label="Go to home"
        position="absolute"
        top={2}
        left={[2, 3]}
        zIndex={1002}
        display="flex"
        alignItems="center"
        justifyContent="center"
        boxSize={["38px", "42px"]}
        borderRadius="md"
        transition="transform 150ms ease, box-shadow 150ms ease"
        _hover={{ transform: "scale(1.04)" }}
        _focusVisible={{
          outline: "none",
          boxShadow: "0 0 0 2px var(--chakra-colors-electric-purple-300)",
        }}
      >
        <Image
          src="/SVG/insignia.svg"
          alt=""
          boxSize="100%"
          borderRadius="md"
          draggable={false}
        />
      </Link>
    </Box>
  );
}
