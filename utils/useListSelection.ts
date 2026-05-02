import { useState, useEffect } from "react";

interface ListSelectionState<T> {
  selectedIndex: number;
  onSelect?: (selectedItem: T | null) => void;
}

interface ListSelectionProps<T> {
  initialItems: T[];
  enabled?: boolean;
  onSelect?: (selectedItem: T | null) => void;
}

function useListSelection<T extends Record<string, unknown>>({
  initialItems,
  enabled = true,
  onSelect,
}: ListSelectionProps<T>): ListSelectionState<T> {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!initialItems.length) {
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prevIndex) =>
          prevIndex <= 0 ? initialItems.length - 1 : prevIndex - 1
        );
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prevIndex) =>
          prevIndex === initialItems.length - 1 ? 0 : prevIndex + 1
        );
      } else if (event.key === "Enter") {
        event.preventDefault();
        const selectedItem = initialItems[selectedIndex];
        if (onSelect) {
          onSelect(selectedItem || null);
        }
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown as unknown as EventListener,
      true
    );
    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown as unknown as EventListener,
        true
      );
    };
  }, [enabled, initialItems, selectedIndex, onSelect]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [initialItems]);

  return { selectedIndex, onSelect };
}

export default useListSelection;
