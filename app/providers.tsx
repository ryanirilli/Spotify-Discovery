"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ChakraThemeProvider from "../theme/ChakraProvider";
import { Toaster } from "../utils/toaster";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: Infinity } },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraThemeProvider>
        {children}
        <Toaster />
      </ChakraThemeProvider>
    </QueryClientProvider>
  );
}
