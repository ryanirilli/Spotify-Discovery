"use client";

import { Box } from "@chakra-ui/react";

interface ISpotifyTopNav {
  children: React.ReactNode;
}

export default function SpotifyTopNav({ children }: ISpotifyTopNav) {
  return (
    <Box pt={2} pb={2}>
      {children}
    </Box>
  );
}
