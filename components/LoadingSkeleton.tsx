import { Box, BoxProps, List } from "@chakra-ui/react";
import CollectionCoverSwirl from "./CollectionCoverSwirl";

type LoadingBoxProps = BoxProps;

export function LoadingBox({
  borderRadius = "md",
  bg = "gray.950",
  ...props
}: LoadingBoxProps) {
  return (
    <Box
      position="relative"
      overflow="hidden"
      borderRadius={borderRadius}
      bg={bg}
      {...props}
    >
      <CollectionCoverSwirl />
    </Box>
  );
}

interface LoadingTextRowsProps {
  count?: number;
  height?: BoxProps["h"];
  widths?: BoxProps["w"][];
  px?: BoxProps["px"];
  my?: BoxProps["my"];
  opacity?: BoxProps["opacity"];
}

export function LoadingTextRows({
  count = 6,
  height = "20px",
  widths = ["100%", "86%", "94%", "72%"],
  px = 2,
  my = 2,
  opacity = 0.75,
}: LoadingTextRowsProps) {
  return (
    <List.Root listStyle="none">
      {Array.from({ length: count }).map((_, index) => (
        <List.Item key={index} px={px} my={my} opacity={opacity}>
          <LoadingBox
            h={height}
            w={widths[index % widths.length]}
            borderRadius="full"
          />
        </List.Item>
      ))}
    </List.Root>
  );
}
