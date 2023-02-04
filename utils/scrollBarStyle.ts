const scrollBarStyle = {
  scrollbarWidth: "thin",
  scrollbarColor: "var(--chakra-colors-blue-500) #F5F5F5",
  "&::-webkit-scrollbar": {
    width: "0.2em",
    height: "0.2em",
    backgroundColor: "var(--chakra-colors-gray-600)",
  },

  "&::-webkit-scrollbar-thumb": {
    borderRadius: "10px",
    backgroundColor: "var(--chakra-colors-blue-500)",
  },

  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "var(--chakra-colors-blue-300)",
  },
};

export default scrollBarStyle;

export const topNavScrollBarStyle = {
  scrollbarWidth: "thin",
  scrollbarColor: "var(--chakra-colors-blue-500) #F5F5F5",
  "&::-webkit-scrollbar": {
    width: "0.2em",
    height: "0.2em",
    backgroundColor: "var(--chakra-colors-blackAlpha-400)",
  },

  "&::-webkit-scrollbar-thumb": {
    borderRadius: "10px",
    backgroundColor: "var(--chakra-colors-blue-500)",
  },

  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "var(--chakra-colors-blue-300)",
  },
};
