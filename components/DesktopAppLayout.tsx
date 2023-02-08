"use client";

import { Box, Grid } from "@chakra-ui/react";
import { createContext, useContext, useState } from "react";
import SpotifyAttribution from "./SpotifyAttribution";
import { SpotifyRecommendationsContext } from "./SpotifyRecommendationsProvider";

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

const DesktopAppLayout = ({
  topNav,
  leftSidebar,
  children,
}: IDesktopAppLayout) => {
  const { artists, genres } = useContext(SpotifyRecommendationsContext) || {};
  const hasSeeds = Boolean(artists?.length || genres?.length);
  const [topNavHeight, setTopNavHeight] = useState(0);
  return (
    <TopNavHeightContext.Provider value={{ topNavHeight, setTopNavHeight }}>
      <Grid
        templateColumns={["1fr", "minmax(200px, 15%) 1fr"]}
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
        minH="100vh"
      >
        <Box
          gridArea="topnav"
          bg="black"
          width="100%"
          position="sticky"
          top={0}
          zIndex="dropdown"
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
          >
            {leftSidebar}
          </Box>
        </Box>
        <Box gridArea="maincontent" bg="gray.900">
          {children}
        </Box>
      </Grid>
      <SpotifyAttribution
        py={2}
        display={["flex", null, "none"]}
        bg="blackAlpha.700"
        position="fixed"
        bottom={0}
        w="100vw"
      />
    </TopNavHeightContext.Provider>
  );
};

export default DesktopAppLayout;
