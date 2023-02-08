"use client";

import useElementHeight from "@/utils/useElementHeight";
import { Box } from "@chakra-ui/react";
import { useContext, useEffect, useRef } from "react";
import { TopNavHeightContext } from "./DesktopAppLayout";

interface ISpotifyTopNav {
  children: React.ReactNode;
}

export default function SpotifyTopNav({ children }: ISpotifyTopNav) {
  const topNavRef = useRef<HTMLDivElement>(null);
  const height = useElementHeight(topNavRef);
  const { setTopNavHeight } = useContext(TopNavHeightContext);
  useEffect(() => {
    setTopNavHeight(height);
  }, [height]);
  return (
    <Box pt={2} pb={2} ref={topNavRef}>
      {children}
    </Box>
  );
}
