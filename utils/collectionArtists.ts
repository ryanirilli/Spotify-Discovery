export function getArtistNamesLabel(artistNames: string[], maxVisible = 3) {
  const visibleNames = artistNames.slice(0, maxVisible);
  const remainingCount = artistNames.length - visibleNames.length;

  return remainingCount > 0
    ? `${visibleNames.join(", ")} + ${remainingCount} more`
    : visibleNames.join(", ");
}
