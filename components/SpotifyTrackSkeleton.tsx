import { AspectRatio, Box, Card, Flex } from "@chakra-ui/react";
import { LoadingBox } from "./LoadingSkeleton";

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
          <LoadingBox w="100%" h="100%" borderRadius="0" />
        </AspectRatio>
        <Flex
          bg="gray.950"
          borderTopRadius="md"
          mt={2}
          h="20px"
          opacity={0.75}
        />
      </Box>
      <Box h={2} />
      <Box
        bg="gray.950"
        borderBottomRadius="md"
        borderWidth="1px"
        borderTopWidth="0"
        borderColor="whiteAlpha.200"
        opacity={0.75}
      >
        <Box p={2}>
          <LoadingBox h="16px" mb={1} borderRadius="sm" w="70%" />
          <LoadingBox h="14px" borderRadius="sm" w="45%" />
        </Box>
        <Flex h="32px" />
      </Box>
    </Card.Root>
  );
}
