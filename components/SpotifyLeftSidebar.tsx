"use client";

import { Box, Flex, Tooltip } from "@chakra-ui/react";
import { useContext } from "react";
import { TbPlaylist } from "react-icons/tb";
import { IconButton } from "@/components/ui/Button";
import scrollBarStyle from "@/utils/scrollBarStyle";
import {
  SidebarCollapseContext,
  SIDEBAR_COLLAPSED_WIDTH_PX,
  SIDEBAR_EXPANDED_WIDTH_PX,
} from "./DesktopAppLayout";
import SpotifyCreatePlaylistButton from "./SpotifyCreatePlaylistButton";
import SpotifyPlaylists from "./SpotifyPlaylists";
import SpotifyUserInfo from "./SpotifyUserInfo";

const FADE_TRANSITION = "opacity 250ms ease";

export default function SpotifyLeftSidebar() {
  const { isSidebarCollapsed, toggleSidebar } = useContext(
    SidebarCollapseContext
  );

  return (
    <Box position="relative" h="100%">
      {/* Expanded layout — always rendered at the full width so contents
          don't reflow as the column resizes. Clipped by the parent's
          overflow:hidden during the collapse transition. */}
      <Flex
        direction="column"
        h="100%"
        w={`${SIDEBAR_EXPANDED_WIDTH_PX}px`}
        opacity={isSidebarCollapsed ? 0 : 1}
        transition={FADE_TRANSITION}
        pointerEvents={isSidebarCollapsed ? "none" : "auto"}
      >
        <Box flex={1} minH={0} overflowY="auto" css={scrollBarStyle}>
          <SpotifyPlaylists />
          <SpotifyCreatePlaylistButton />
        </Box>
        <Box flexShrink={0} p={4}>
          <SpotifyUserInfo />
        </Box>
      </Flex>

      {/* Collapsed layout — absolutely positioned overlay, fades in when
          the sidebar is collapsed. Width matches the collapsed column. */}
      <Flex
        position="absolute"
        top={0}
        left={0}
        bottom={0}
        direction="column"
        align="center"
        w={`${SIDEBAR_COLLAPSED_WIDTH_PX}px`}
        pt={2}
        gap={1}
        opacity={isSidebarCollapsed ? 1 : 0}
        transition={FADE_TRANSITION}
        pointerEvents={isSidebarCollapsed ? "auto" : "none"}
      >
        <Tooltip.Root openDelay={300} positioning={{ placement: "right" }}>
          <Tooltip.Trigger asChild>
            <IconButton
              visual="ghost"
              size="sm"
              aria-label="Expand sidebar"
              onClick={toggleSidebar}
            >
              <TbPlaylist />
            </IconButton>
          </Tooltip.Trigger>
          <Tooltip.Positioner>
            <Tooltip.Content>Playlists</Tooltip.Content>
          </Tooltip.Positioner>
        </Tooltip.Root>
      </Flex>
    </Box>
  );
}
