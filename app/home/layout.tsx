import SpotifyCurrentTrackProvider from "@/components/SpotifyCurrentTrackProvider";
import SpotifyPlaylistsProvider from "@/components/SpotifyPlaylistsProvider";
import SpotifyRecommendationsProvider from "@/components/SpotifyRecommendationsProvider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SpotifyRecommendationsProvider>
      <SpotifyPlaylistsProvider>
        <SpotifyCurrentTrackProvider>{children}</SpotifyCurrentTrackProvider>
      </SpotifyPlaylistsProvider>
    </SpotifyRecommendationsProvider>
  );
}
