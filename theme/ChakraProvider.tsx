"use client";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import Modal from "@/theme/Modal";
import Progress from "@/theme/Progress";
import colors from "@/theme/colors";

interface IChakraThemeProvider {
  children: React.ReactNode;
}

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "black",
        minH: "100vh",
      },
    },
  },
  components: {
    Modal,
    Progress,
  },
  colors,
});

function ChakraThemeProvider({ children }: IChakraThemeProvider) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}

export default ChakraThemeProvider;
