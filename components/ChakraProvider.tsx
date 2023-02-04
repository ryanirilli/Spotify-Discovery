"use client";

import { ChakraProvider } from "@chakra-ui/react";

interface IChakraThemeProvider {
  children: React.ReactNode;
}

function ChakraThemeProvider({ children }: IChakraThemeProvider) {
  return <ChakraProvider>{children}</ChakraProvider>;
}

export default ChakraThemeProvider;
