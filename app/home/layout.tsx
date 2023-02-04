import SpotifyCurrentTrackProvider from "@/components/SpotifyCurrentTrackProvider";
import SpotifyRecommendationsProvider from "@/components/SpotifyRecommendationsProvider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SpotifyRecommendationsProvider>
      <SpotifyCurrentTrackProvider>{children}</SpotifyCurrentTrackProvider>
    </SpotifyRecommendationsProvider>
  );
}
