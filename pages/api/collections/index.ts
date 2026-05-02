import { desc } from "drizzle-orm";
import type { NextApiRequest, NextApiResponse } from "next";
import { waitUntil } from "@vercel/functions";
import spotifyApi from "@/lib/SpotifyClient";
import setSpotifyAccessToken from "@/lib/setSpotifyAccessToken";
import { getDb } from "@/db";
import { collections } from "@/db/schema";
import { generateCollectionCover } from "@/lib/collections/generateCollectionCover";
import { isCollectionTitleAppropriate } from "@/lib/collections/moderateTitle";
import { serializeCollection } from "@/lib/collections/serializeCollection";
import {
  getEnabledArtistsForConfig,
  hasRecommendationSeeds,
  normalizeSearchConfig,
} from "@/utils/spotifySearchConfig";
import { TSpotifyCollectionArtistSnapshot } from "@/types/SpotifyCollection";

const MAX_TITLE_LENGTH = 80;

function normalizeTitle(value: unknown) {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ").slice(0, MAX_TITLE_LENGTH)
    : "";
}

function getBestArtistImage(
  artist: SpotifyApi.ArtistObjectFull
): string | null {
  return artist.images[0]?.url || null;
}

async function getArtistSnapshot(
  artistIds: string[]
): Promise<TSpotifyCollectionArtistSnapshot[]> {
  if (!artistIds.length) return [];

  const data = await spotifyApi.getArtists(artistIds);
  return (data.body.artists || []).map((artist) => ({
    id: artist.id,
    name: artist.name,
    imageUrl: getBestArtistImage(artist),
  }));
}

export default async function SpotifyCollections(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return await setSpotifyAccessToken(req, res, spotifyApi, async () => {
    if (req.method === "GET") {
      const rows = await getDb()
        .select()
        .from(collections)
        .orderBy(desc(collections.createdAt));

      return res.status(200).json(rows.map(serializeCollection));
    }

    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      return res.status(405).json({ error: "Method not allowed" });
    }

    const title = normalizeTitle(req.body?.title);
    const config = normalizeSearchConfig(req.body?.config);

    if (!title) {
      return res.status(400).json({ error: "Collection title is required" });
    }

    if (!hasRecommendationSeeds(config)) {
      return res
        .status(400)
        .json({ error: "Collection requires at least one artist or genre" });
    }

    const [me, artistSnapshot, titleOk] = await Promise.all([
      spotifyApi.getMe(),
      getArtistSnapshot(getEnabledArtistsForConfig(config)),
      isCollectionTitleAppropriate(title),
    ]);

    if (!titleOk) {
      return res
        .status(400)
        .json({ error: "Please choose a different title" });
    }
    const ownerId = me.body.id;

    if (!ownerId) {
      return res.status(401).json({ error: "Spotify user id is required" });
    }

    const now = new Date();
    const [created] = await getDb()
      .insert(collections)
      .values({
        id: crypto.randomUUID(),
        title,
        ownerSpotifyUserId: ownerId,
        ownerDisplayName: me.body.display_name || null,
        config,
        artistSnapshot,
        coverStatus: "pending",
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    waitUntil(
      generateCollectionCover({
        collectionId: created.id,
        title: created.title,
        artists: artistSnapshot,
      })
    );

    return res.status(201).json(serializeCollection(created));
  });
}
