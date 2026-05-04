import { Icon } from "@chakra-ui/react";
import { MdClose } from "react-icons/md";
import { Button, type ButtonProps } from "./ui/Button";

export default function DialogCloseButton({
  children,
  ...props
}: ButtonProps) {
  return (
    <Button
      type="button"
      visual="secondary"
      size="sm"
      aria-label="Close"
      position="absolute"
      top={3}
      right={3}
      zIndex={1}
      {...props}
    >
      {children ?? <Icon as={MdClose} />}
    </Button>
  );
}
