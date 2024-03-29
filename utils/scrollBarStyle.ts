const scrollBarStyle = {
  scrollbarWidth: "thin",
  scrollbarColor: "var(--chakra-colors-gray-50) #F5F5F5",
  "&::-webkit-scrollbar": {
    width: "0.2em",
    height: "0.2em",
    backgroundColor: "var(--chakra-colors-whiteAlpha-300)",
  },

  "&::-webkit-scrollbar-thumb": {
    borderRadius: "10px",
    backgroundColor: "var(--chakra-colors-gray-50)",
  },

  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "var(--chakra-colors-whiteAlpha-300)",
  },
};

export default scrollBarStyle;

export const topNavScrollBarStyle = {
  scrollbarWidth: "thin",
  scrollbarColor: "var(--chakra-colors-whiteAlpha-500) #F5F5F5",
  "&::-webkit-scrollbar": {
    width: "0.2em",
    height: "0.2em",
    backgroundColor: "var(--chakra-colors-blackAlpha-300)",
  },

  "&::-webkit-scrollbar-thumb": {
    borderRadius: "10px",
    backgroundColor: "var(--chakra-colors-whiteAlpha-500)",
  },

  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "var(--chakra-colors-whiteAlpha-300)",
  },
};
