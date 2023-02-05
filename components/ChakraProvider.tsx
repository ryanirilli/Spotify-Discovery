"use client";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import Modal from "@/theme/Modal";
import colors from "@/theme/colors";

interface IChakraThemeProvider {
  children: React.ReactNode;
}

const theme = extendTheme({
  components: {
    Modal,
  },
  colors,
});

function ChakraThemeProvider({ children }: IChakraThemeProvider) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}

export default ChakraThemeProvider;
