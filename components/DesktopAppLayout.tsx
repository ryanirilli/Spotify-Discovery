"use client";

import { Box, Grid } from "@chakra-ui/react";
import { createContext, useContext, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
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

const DesktopAppLayout = ({
  topNav,
  leftSidebar,
  children,
}: IDesktopAppLayout) => {
  const [topNavHeight, setTopNavHeight] = useState(0);
  const isWebkitFillAvailable = useWebkitFillAvailableSupported();
  const { isNew, setIsNew } = useContext(SpotifyAutocompleteContext);

  return (
    <DndProvider backend={HTML5Backend}>
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
          minH={isWebkitFillAvailable ? "-webkit-fill-available" : "100vh"}
        >
          <Box
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
            >
              {leftSidebar}
            </Box>
          </Box>
          <Box gridArea="maincontent" bg="gray.900" position="relative">
            {children}
          </Box>
        </Grid>
      </TopNavHeightContext.Provider>
    </DndProvider>
  );
};

export default DesktopAppLayout;
