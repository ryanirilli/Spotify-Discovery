"use client";

import { Box, Grid } from "@chakra-ui/react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import useElementHeight from "@/utils/useElementHeight";
import useWebkitFillAvailableSupported from "@/utils/useWebkitFillAvailableSupported";
import { SpotifyAutocompleteContext } from "./SpotifyAutocomplete";
interface IDesktopAppLayout {
  children: React.ReactNode;
  topNav: React.ReactNode;
  leftSidebar: React.ReactNode;
}

interface ITopNavHeightContext {
  topNavHeight: number;
  setTopNavHeight: (height: number) => void;
}

export const TopNavHeightContext = createContext<ITopNavHeightContext>({
  topNavHeight: 0,
  setTopNavHeight(height) {
    return height;
  },
});

interface ISidebarCollapseContext {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const SidebarCollapseContext = createContext<ISidebarCollapseContext>({
  isSidebarCollapsed: false,
  toggleSidebar() {},
});

const SIDEBAR_COLLAPSED_KEY = "desktopSidebarCollapsed";
export const SIDEBAR_COLLAPSED_WIDTH_PX = 56;
export const SIDEBAR_EXPANDED_WIDTH_PX = 240;

const DesktopAppLayout = ({
  topNav,
  leftSidebar,
  children,
}: IDesktopAppLayout) => {
  const [topNavHeight, setTopNavHeight] = useState(0);
  const topNavRef = useRef<HTMLDivElement>(null);
  const measuredTopNavHeight = useElementHeight(topNavRef);
  const isWebkitFillAvailable = useWebkitFillAvailableSupported();
  const { isNew, setIsNew } = useContext(SpotifyAutocompleteContext);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    setTopNavHeight(measuredTopNavHeight);
  }, [measuredTopNavHeight]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true") {
      setIsSidebarCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      }
      return next;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <SidebarCollapseContext.Provider
        value={{ isSidebarCollapsed, toggleSidebar }}
      >
      <TopNavHeightContext.Provider value={{ topNavHeight, setTopNavHeight }}>
        {isNew && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.900"
            zIndex="overlay"
            onClick={() => {
              setIsNew(false);
            }}
          />
        )}
        <Grid
          templateColumns={[
            "1fr",
            isSidebarCollapsed
              ? `${SIDEBAR_COLLAPSED_WIDTH_PX}px 1fr`
              : `${SIDEBAR_EXPANDED_WIDTH_PX}px 1fr`,
          ]}
          transition="grid-template-columns 450ms cubic-bezier(0.87, 0, 0.13, 1)"
          templateRows="auto 1fr"
          templateAreas={[
            `
        "topnav topnav"
        "maincontent maincontent"
      `,
            `
        "topnav topnav"
        "leftsidebar maincontent"
      `,
          ]}
          minH={isWebkitFillAvailable ? "-webkit-fill-available" : "100vh"}
        >
          <Box
            ref={topNavRef}
            gridArea="topnav"
            bg="black"
            width="100%"
            position="sticky"
            top={0}
            zIndex="overlay"
            display="block"
          >
            {topNav}
          </Box>
          <Box
            display={["none", "block"]}
            gridArea="leftsidebar"
            bg="black"
            borderRight="1px"
            borderRightColor="whiteAlpha.300"
            color="white"
            position="relative"
          >
            <Box
              position={"sticky"}
              top={`${topNavHeight}px`}
              zIndex="docked"
              height={`calc(100vh - ${topNavHeight}px)`}
              overflow="hidden"
            >
              {leftSidebar}
            </Box>
          </Box>
          <Box gridArea="maincontent" bg="gray.900" position="relative">
            {children}
          </Box>
        </Grid>
      </TopNavHeightContext.Provider>
      </SidebarCollapseContext.Provider>
    </DndProvider>
  );
};

export default DesktopAppLayout;
