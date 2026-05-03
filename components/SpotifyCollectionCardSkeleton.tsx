import { AspectRatio, Box } from "@chakra-ui/react";
import { LoadingBox } from "./LoadingSkeleton";

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
        <LoadingBox w="100%" h="100%" borderRadius="0" />
      </AspectRatio>
      <Box p={3} minH="84px">
        <LoadingBox
          h="20px"
          w="70%"
          mb={3}
          borderRadius="sm"
        />
        <LoadingBox
          h="14px"
          w="45%"
          borderRadius="sm"
        />
      </Box>
    </Box>
  );
}
