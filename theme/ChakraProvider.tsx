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
    textStyles: {
      brandDisplay: {
        value: {
          fontSize: ["4xl", "5xl", "6xl", "7xl"],
          lineHeight: "1",
          fontWeight: "normal",
        },
      },
      displayTitle: {
        value: {
          fontSize: ["4xl", "5xl", "6xl", "7xl"],
          lineHeight: "1.05",
          letterSpacing: "-0.02em",
          fontWeight: "bold",
        },
      },
      displayBody: {
        value: {
          fontSize: ["md", "lg", "xl"],
          lineHeight: "1.5",
          fontWeight: "normal",
        },
      },
      pageTitle: {
        value: {
          fontSize: "2xl",
          lineHeight: "1.2",
          fontWeight: "semibold",
        },
      },
      sectionTitle: {
        value: {
          fontSize: "md",
          lineHeight: "1.25",
          fontWeight: "semibold",
        },
      },
      itemTitle: {
        value: {
          fontSize: "sm",
          lineHeight: "1.3",
          fontWeight: "semibold",
        },
      },
      itemMeta: {
        value: {
          fontSize: "xs",
          lineHeight: "1.35",
          fontWeight: "normal",
        },
      },
      body: {
        value: {
          fontSize: "sm",
          lineHeight: "1.5",
          fontWeight: "normal",
        },
      },
      controlLabel: {
        value: {
          fontSize: "sm",
          lineHeight: "1.25",
          fontWeight: "semibold",
        },
      },
      microLabel: {
        value: {
          fontSize: "xs",
          lineHeight: "1.15",
          fontWeight: "medium",
        },
      },
      dialogTitle: {
        value: {
          fontSize: "md",
          lineHeight: "1.25",
          fontWeight: "semibold",
        },
      },
      statusText: {
        value: {
          fontSize: "sm",
          lineHeight: "1.4",
          fontWeight: "normal",
        },
      },
    },
    recipes: {
      // Three-variant button system: primary (electric purple CTA),
      // secondary (whiteAlpha pill), ghost (transparent w/ hover).
      // Selected via the custom `visual` prop, e.g. <Button visual="primary" />.
      // Sizes (xs/sm/md/lg) come from Chakra defaults and are not redeclared.
      // Same recipe applies to <IconButton />.
      button: {
        className: "chakra-button",
        base: {
          borderRadius: "full",
          fontWeight: "semibold",
          borderWidth: "0",
          _icon: { flexShrink: 0 },
        },
        variants: {
          visual: {
            primary: {
              bg: "electricPurple.500",
              color: "white",
              _hover: { bg: "electricPurple.400" },
              _active: { bg: "electricPurple.600" },
              _disabled: { opacity: 0.4, cursor: "not-allowed" },
            },
            secondary: {
              bg: "whiteAlpha.200",
              color: "white",
              _hover: { bg: "whiteAlpha.300" },
              _active: { bg: "whiteAlpha.400" },
              _disabled: { opacity: 0.4, cursor: "not-allowed" },
            },
            ghost: {
              bg: "transparent",
              color: "whiteAlpha.900",
              _hover: { bg: "whiteAlpha.200", color: "white" },
              _active: { bg: "whiteAlpha.300" },
              _disabled: { opacity: 0.4, cursor: "not-allowed" },
            },
          },
        },
      },
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
      // Dark-theme switch: muted whiteAlpha track when off, electric
      // purple when on. Thumb scaled so its visible padding matches on
      // both sides.
      switch: {
        slots: ["root", "label", "indicator", "control", "thumb"],
        variants: {
          variant: {
            solid: {
              control: {
                bg: "whiteAlpha.200",
                _checked: {
                  bg: "electricPurple.500",
                },
              },
              thumb: {
                bg: "white",
                scale: "0.85",
                _checked: {
                  bg: "white",
                },
              },
            },
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
