"use client";

import { Box } from "@chakra-ui/react";
import { usePathname } from "next/navigation";

interface ISpotifyTopNav {
  children: React.ReactNode;
}

export default function SpotifyTopNav({ children }: ISpotifyTopNav) {
  const pathname = usePathname();
  const isHidden = pathname?.startsWith("/track/");

  return (
    <Box
      pt={2}
      pb={2}
      borderBottom={["none", "1px"]}
      borderColor="whiteAlpha.300"
      display={isHidden ? "none" : "block"}
    >
      {children}
    </Box>
  );
}
