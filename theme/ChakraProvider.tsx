"use client";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import Modal from "@/theme/Modal";
import Progress from "@/theme/Progress";
import colors from "@/theme/colors";

interface IChakraThemeProvider {
  children: React.ReactNode;
}

const theme = extendTheme({
  components: {
    Modal,
    Progress,
  },
  colors,
});

console.log(theme);

function ChakraThemeProvider({ children }: IChakraThemeProvider) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}

export default ChakraThemeProvider;
