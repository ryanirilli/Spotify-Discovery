"use client";
import ChakraThemeProvider from "../components/ChakraProvider";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

queryClient.setDefaultOptions({
  queries: {
    staleTime: Infinity,
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body>
        <QueryClientProvider client={queryClient}>
          <ChakraThemeProvider>{children}</ChakraThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
