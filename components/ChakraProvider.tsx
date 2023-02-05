"use client";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import Modal from "@/theme/Modal";

interface IChakraThemeProvider {
  children: React.ReactNode;
}

const theme = extendTheme({
  components: {
    Modal,
  },
});

function ChakraThemeProvider({ children }: IChakraThemeProvider) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}

export default ChakraThemeProvider;
