import SpotifyTrackDetailView from "@/components/SpotifyTrackDetailView";

export default async function TrackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SpotifyTrackDetailView id={id} />;
}
