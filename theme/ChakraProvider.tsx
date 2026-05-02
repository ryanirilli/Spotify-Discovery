"use client";

import { ChakraProvider, createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  globalCss: {
    body: {
      bg: "black",
      minH: "100vh",
      // Set the `colorPalette` CSS variables directly on body so all
      // descendants inherit electricPurple without a wrapper DOM element
      // (which causes hydration mismatches when added inside ChakraProvider).
      "--chakra-colors-color-palette-50": "var(--chakra-colors-electric-purple-50)",
      "--chakra-colors-color-palette-100": "var(--chakra-colors-electric-purple-100)",
      "--chakra-colors-color-palette-200": "var(--chakra-colors-electric-purple-200)",
      "--chakra-colors-color-palette-300": "var(--chakra-colors-electric-purple-300)",
      "--chakra-colors-color-palette-400": "var(--chakra-colors-electric-purple-400)",
      "--chakra-colors-color-palette-500": "var(--chakra-colors-electric-purple-500)",
      "--chakra-colors-color-palette-600": "var(--chakra-colors-electric-purple-600)",
      "--chakra-colors-color-palette-700": "var(--chakra-colors-electric-purple-700)",
      "--chakra-colors-color-palette-800": "var(--chakra-colors-electric-purple-800)",
      "--chakra-colors-color-palette-900": "var(--chakra-colors-electric-purple-900)",
      "--chakra-colors-color-palette-950": "var(--chakra-colors-electric-purple-950)",
    },
  },
  theme: {
    recipes: {
      // Normalize all <Input /> instances across the app. Components that
      // need a bespoke look (e.g. the artist autocomplete) opt out via the
      // `unstyled` prop, which bypasses this recipe entirely.
      input: {
        base: {
          color: "white",
          _placeholder: { color: "gray.400" },
        },
        variants: {
          variant: {
            outline: {
              bg: "whiteAlpha.100",
              borderWidth: "1px",
              borderColor: "transparent",
              focusVisibleRing: "none",
              _focusVisible: {
                borderColor: "electricPurple.500",
                boxShadow: "none",
              },
            },
            subtle: {
              bg: "whiteAlpha.100",
              borderWidth: "1px",
              borderColor: "transparent",
              focusVisibleRing: "none",
              _focusVisible: {
                borderColor: "electricPurple.500",
                boxShadow: "none",
              },
            },
          },
        },
      },
    },
    slotRecipes: {
      // Darker, blurred backdrop on every Dialog/Drawer for stronger focus.
      dialog: {
        slots: ["backdrop"],
        base: {
          backdrop: {
            bg: "blackAlpha.800",
            backdropFilter: "blur(8px)",
          },
        },
      },
    },
    tokens: {
      colors: {
        // Electric purple — brand accent used for all CTAs and highlights.
        // Full 50-950 scale so Chakra's semantic slots (solid, emphasized,
        // muted, subtle, contrast, fg, focusRing) all resolve.
        electricPurple: {
          50: { value: "#faf0ff" },
          100: { value: "#f3d9ff" },
          200: { value: "#e7b3ff" },
          300: { value: "#d98dff" },
          400: { value: "#c859ff" },
          500: { value: "#b026ff" },
          600: { value: "#9a1ee0" },
          700: { value: "#7d17b3" },
          800: { value: "#5f1186" },
          900: { value: "#410b5c" },
          950: { value: "#2b0740" },
        },
        // Spotify brand green — reserved for Spotify-specific UI surfaces
        // (e.g. the user avatar fallback background). Not used for CTAs.
        spotifyGreen: {
          50: { value: "#e6faec" },
          100: { value: "#c3f0d1" },
          200: { value: "#9be7b1" },
          300: { value: "#6fdd8f" },
          400: { value: "#4acc6f" },
          500: { value: "#1DB954" },
          600: { value: "#18a149" },
          700: { value: "#14883d" },
          800: { value: "#0f6f31" },
          900: { value: "#0a5625" },
          950: { value: "#063d19" },
        },
      },
    },
  },
});

const system = createSystem(defaultConfig, config);

interface IChakraThemeProvider {
  children: React.ReactNode;
}

function ChakraThemeProvider({ children }: IChakraThemeProvider) {
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}

export default ChakraThemeProvider;
