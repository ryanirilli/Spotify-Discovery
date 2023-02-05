"use client";

import { Box, Grid, Flex } from "@chakra-ui/react";

interface IDesktopAppLayout {
  children: React.ReactNode;
  topNav: React.ReactNode;
  leftSidebar: React.ReactNode;
}

const DesktopAppLayout = ({
  topNav,
  leftSidebar,
  children,
}: IDesktopAppLayout) => {
  return (
    <Box>
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
          zIndex="docked"
          display="block"
        >
          {topNav}
        </Box>
        <Box
          display={["none", "block"]}
          gridArea="leftsidebar"
          bg="black"
          color="white"
          position="relative"
        >
          <Box position={"sticky"} top={28}>
            {leftSidebar}
          </Box>
        </Box>
        <Box gridArea="maincontent" bg="gray.900">
          {children}
        </Box>
      </Grid>
    </Box>
  );
};

export default DesktopAppLayout;
