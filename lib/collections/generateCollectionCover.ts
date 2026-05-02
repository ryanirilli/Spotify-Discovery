import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { getDb } from "@/db";
import { collections } from "@/db/schema";
import { TSpotifyCollectionArtistSnapshot } from "@/types/SpotifyCollection";

const DEFAULT_IMAGE_MODEL = "gpt-image-2";

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required to generate collection covers");
  }
  return new OpenAI({ apiKey });
}

function buildPrompt(
  title: string,
  artists: TSpotifyCollectionArtistSnapshot[]
) {
  const artistNames = artists
    .map((artist) => artist.name)
    .slice(0, 3)
    .join(", ");

  return [
    `Create a square abstract cover image for a music discovery collection titled "${title}".`,
    artistNames
      ? `Use the genre and mood of these artists as inspiration: ${artistNames}.`
      : "Use the title as the primary mood and genre cue.",
    "Style: polished, modern, music-forward, suitable as a small card thumbnail.",
    "Do not depict any people, faces, or recognizable likenesses.",
    "Do not include text, typography, logos, UI, app branding, or recognizable copyrighted characters.",
  ].join(" ");
}

async function markCoverFailed(collectionId: string) {
  await getDb()
    .update(collections)
    .set({ coverStatus: "failed", updatedAt: new Date() })
    .where(eq(collections.id, collectionId));
}

export async function generateCollectionCover({
  collectionId,
  title,
  artists,
}: {
  collectionId: string;
  title: string;
  artists: TSpotifyCollectionArtistSnapshot[];
}) {
  try {
    const openai = getOpenAIClient();
    const model = process.env.OPENAI_IMAGE_MODEL || DEFAULT_IMAGE_MODEL;
    const result = await openai.images.generate({
      model,
      prompt: buildPrompt(title, artists),
      quality: "low",
      size: "1024x1024",
    });

    const base64Image = result.data?.[0]?.b64_json;
    if (!base64Image) {
      throw new Error("OpenAI did not return image data");
    }

    const image = Buffer.from(base64Image, "base64");
    const pathname = `collections/${collectionId}/cover.png`;
    const blob = await put(pathname, image, {
      access: "public",
      contentType: "image/png",
      allowOverwrite: true,
    });

    await getDb()
      .update(collections)
      .set({
        coverStatus: "ready",
        coverImageUrl: blob.url,
        coverBlobPath: pathname,
        updatedAt: new Date(),
      })
      .where(eq(collections.id, collectionId));
  } catch (error) {
    console.error("Could not generate collection cover", error);
    await markCoverFailed(collectionId);
  }
}
