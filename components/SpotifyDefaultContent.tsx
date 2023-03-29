"use-client";

import homePageConfig from "@/utils/homePageConfig";
import { Box, Heading, Wrap } from "@chakra-ui/react";
import { SpotifyCollectionCard } from "./SpotifyCollectionCard";

export default function SpotifyDefaultContent() {
  const itemContainerProps = {
    w: ["calc(100% - 16px)", null, "calc(50% - 16px)", "calc(25% - 16px)"],
  };
  return (
    <Box color="white">
      <Box p={[4, null, null, 8]}>
        <Heading mb={4}>Collections</Heading>
        <Wrap spacing={[16, 4]}>
          <Box {...itemContainerProps}>
            <SpotifyCollectionCard isBlank />
          </Box>
          {homePageConfig.defaultCollection.map((data, i) => (
            <Box key={i} {...itemContainerProps}>
              <SpotifyCollectionCard
                name={data.name}
                unSplashId={data.unSplashId}
                artists={data.artists}
              />
            </Box>
          ))}
        </Wrap>
      </Box>
    </Box>
  );
}
