import { CloseButton, type CloseButtonProps } from "@chakra-ui/react";

export default function DialogCloseButton(props: CloseButtonProps) {
  return (
    <CloseButton
      variant="solid"
      colorPalette="whiteAlpha"
      bg="whiteAlpha.300"
      color="white"
      borderRadius="full"
      size="sm"
      position="absolute"
      top={3}
      right={3}
      zIndex={1}
      _hover={{ bg: "whiteAlpha.400" }}
      _active={{ bg: "whiteAlpha.500" }}
      {...props}
    />
  );
}
