import SpotifySeedControls from "@/components/SpotifySeedControls";
import SpotifySeeds from "@/components/SpotifySeeds";
import SpotifyTopNav from "@/components/SpotifyTopNav";
import DesktopAppLayout from "@/components/DesktopAppLayout";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SpotifyLeftSidebar from "@/components/SpotifyLeftSidebar";
import { SpotifyAutocompleteProvider } from "@/components/SpotifyAutocomplete";
import SpotifyCurrentTrackProvider from "@/components/SpotifyCurrentTrackProvider";
import SpotifyPlaylistsProvider from "@/components/SpotifyPlaylistsProvider";
import SpotifyRecommendationsProvider from "@/components/SpotifyRecommendationsProvider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nextCookies = await cookies();
  const { value: spotifyAccessToken } =
    nextCookies.get("spotify_access_token") || {};
  const { value: spotifyRefreshToken } =
    nextCookies.get("spotify_refresh_token") || {};
  if (!spotifyAccessToken && !spotifyRefreshToken) {
    redirect("/");
  }

  return (
    <SpotifyRecommendationsProvider>
      <SpotifyPlaylistsProvider>
        <SpotifyCurrentTrackProvider>
          <SpotifyAutocompleteProvider>
            <DesktopAppLayout
              topNav={
                <SpotifyTopNav>
                  <SpotifySeedControls />
                  <SpotifySeeds />
                </SpotifyTopNav>
              }
              leftSidebar={<SpotifyLeftSidebar />}
            >
              {children}
            </DesktopAppLayout>
          </SpotifyAutocompleteProvider>
        </SpotifyCurrentTrackProvider>
      </SpotifyPlaylistsProvider>
    </SpotifyRecommendationsProvider>
  );
}
