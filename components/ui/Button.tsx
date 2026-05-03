import {
  Button as ChakraButton,
  IconButton as ChakraIconButton,
  type ButtonProps as ChakraButtonProps,
  type IconButtonProps as ChakraIconButtonProps,
} from "@chakra-ui/react";
import { forwardRef } from "react";

export type ButtonVisual = "primary" | "secondary" | "ghost";

export type ButtonProps = Omit<ChakraButtonProps, "variant"> & {
  visual?: ButtonVisual;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ visual, ...rest }, ref) {
    const extra = { visual: visual ?? "primary" } as Record<string, string>;
    return <ChakraButton ref={ref} {...rest} {...extra} />;
  },
);

export type IconButtonProps = Omit<ChakraIconButtonProps, "variant"> & {
  visual?: ButtonVisual;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ visual, ...rest }, ref) {
    const extra = { visual: visual ?? "ghost" } as Record<string, string>;
    return <ChakraIconButton ref={ref} {...rest} {...extra} />;
  },
);
