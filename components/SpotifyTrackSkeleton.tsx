import { AspectRatio, Box, Card } from "@chakra-ui/react";
import { LoadingBox } from "./LoadingSkeleton";
import CollectionCoverPlaceholder from "./CollectionCoverPlaceholder";

export default function SpotifyTrackSkeleton({ seed }: { seed?: string }) {
  return (
    <Card.Root
      m={2}
      mb={[8, 2]}
      w="100%"
      bg="transparent"
      borderWidth="0"
      pointerEvents="none"
    >
      <AspectRatio ratio={1} overflow="hidden" position="relative">
        <CollectionCoverPlaceholder seed={seed} />
      </AspectRatio>
      <Box mt={3} px={1} pb={1} opacity={0.68}>
        <LoadingBox h="14px" mb={2} borderRadius="full" w="68%" />
        <LoadingBox h="10px" borderRadius="full" w="42%" />
      </Box>
    </Card.Root>
  );
}
