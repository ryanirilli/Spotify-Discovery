import { AspectRatio, Box } from "@chakra-ui/react";
import CollectionCoverPlaceholder from "./CollectionCoverPlaceholder";
import { LoadingBox } from "./LoadingSkeleton";

export function SpotifyCollectionCardSkeleton({ seed }: { seed?: string }) {
  return (
    <Box
      borderRadius="md"
      h="100%"
      overflow="hidden"
      bg="blackAlpha.400"
      position="relative"
    >
      <AspectRatio ratio={1} overflow="hidden" bg="blackAlpha.600" position="relative">
        <CollectionCoverPlaceholder seed={seed} />
      </AspectRatio>
      <Box p={3} minH="104px">
        <LoadingBox
          h="20px"
          w="70%"
          mb={2}
          borderRadius="sm"
        />
        <LoadingBox
          h="14px"
          w="60%"
          mb={2}
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
