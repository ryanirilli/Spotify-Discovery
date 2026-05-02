import {
  TSpotifyCollection,
} from "@/types/SpotifyCollection";
import { TSpotifySearchConfig } from "@/types/SpotifySearchConfig";

export async function spotifyCollectionsQuery(): Promise<
  TSpotifyCollection[]
> {
  const res = await fetch("/api/collections");
  if (!res.ok) {
    throw new Error("Could not load collections");
  }
  return res.json();
}

export async function createSpotifyCollection({
  title,
  config,
}: {
  title: string;
  config: TSpotifySearchConfig;
}): Promise<TSpotifyCollection> {
  const res = await fetch("/api/collections", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, config }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || "Could not share collection");
  }

  return res.json();
}

export async function deleteSpotifyCollection(id: string) {
  const res = await fetch(`/api/collections/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || "Could not delete collection");
  }

  return res.json();
}
