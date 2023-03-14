"use-client";

import homePageConfig from "@/utils/homePageConfig";
import { Box, Heading, Wrap } from "@chakra-ui/react";
import SpotifyCollectionCard from "./SpotifyCollectionCard";

export default function SpotifyHomePageContent() {
  return (
    <Box color="white">
      <Box p={[4, null, null, 16]}>
        <Heading mb={4}>Disco Stu Selects</Heading>
        <Wrap spacing={4}>
          {homePageConfig.selects.map((data, i) => (
            <Box
              key={i}
              w={[
                "calc(100% - 16px)",
                null,
                "calc(50% - 16px)",
                "calc(25% - 16px)",
              ]}
            >
              <SpotifyCollectionCard
                name={data.name}
                unSplashId={data.unSplashId}
              />
            </Box>
          ))}
        </Wrap>
      </Box>
    </Box>
  );
}
