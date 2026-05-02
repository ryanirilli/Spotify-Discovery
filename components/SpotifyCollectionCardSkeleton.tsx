import { AspectRatio, Box, Skeleton } from "@chakra-ui/react";
import CollectionCoverSwirl from "./CollectionCoverSwirl";

export function SpotifyCollectionCardSkeleton() {
  return (
    <Box
      borderRadius="md"
      h="100%"
      overflow="hidden"
      bg="blackAlpha.400"
      position="relative"
    >
      <AspectRatio ratio={1} overflow="hidden" bg="blackAlpha.600" position="relative">
        <CollectionCoverSwirl />
      </AspectRatio>
      <Box p={3} minH="84px">
        <Skeleton
          h="20px"
          w="70%"
          mb={3}
          bg="whiteAlpha.200"
          css={{ "--start-color": "rgba(255,255,255,0.08)", "--end-color": "rgba(255,255,255,0.18)" }}
        />
        <Skeleton
          h="14px"
          w="45%"
          bg="whiteAlpha.200"
          css={{ "--start-color": "rgba(255,255,255,0.08)", "--end-color": "rgba(255,255,255,0.18)" }}
        />
      </Box>
    </Box>
  );
}
