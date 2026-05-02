import { AspectRatio, Box, Card, Flex } from "@chakra-ui/react";
import CollectionCoverSwirl from "./CollectionCoverSwirl";

export default function SpotifyTrackSkeleton() {
  return (
    <Card.Root
      m={2}
      mb={[8, 2]}
      w="100%"
      bg="black"
      borderWidth="0"
      pointerEvents="none"
    >
      <Box position="relative" overflow="hidden">
        <AspectRatio ratio={1} overflow="hidden" position="relative">
          <CollectionCoverSwirl />
        </AspectRatio>
        <Flex
          bg="gray.200"
          borderTopRadius="md"
          mt={2}
          h="20px"
          opacity={0.15}
        />
      </Box>
      <Box h={2} />
      <Box bg="white" borderBottomRadius="md" opacity={0.15}>
        <Box p={2}>
          <Box h="16px" mb={1} bg="blackAlpha.300" borderRadius="sm" w="70%" />
          <Box h="14px" bg="blackAlpha.200" borderRadius="sm" w="45%" />
        </Box>
        <Flex h="32px" />
      </Box>
    </Card.Root>
  );
}
