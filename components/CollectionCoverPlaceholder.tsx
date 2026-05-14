import type { CSSProperties } from "react";

type CollectionCoverPlaceholderProps = {
  seed?: string | null;
  className?: string;
  style?: CSSProperties;
};

type CollectionCoverPlaceholderStyle = CSSProperties & {
  [key: `--collection-cover-${string}`]: string;
};

const COVER_PALETTES = [
  {
    center: "hsl(176deg 20% 18% / 0.34)",
    bgStart: "hsl(205deg 22% 5% / 1)",
    bgMid: "hsl(282deg 16% 8% / 1)",
    bgEnd: "hsl(155deg 18% 6% / 1)",
    glowA: "hsl(158deg 28% 40% / 0.72)",
    glowB: "hsl(278deg 22% 38% / 0.66)",
    glowC: "hsl(18deg 29% 42% / 0.58)",
    glowD: "hsl(42deg 22% 45% / 0.48)",
    glowE: "hsl(218deg 18% 35% / 0.44)",
    saturation: 0.9,
    noiseOpacity: 0.58,
  },
  {
    center: "hsl(202deg 22% 19% / 0.34)",
    bgStart: "hsl(210deg 24% 5% / 1)",
    bgMid: "hsl(236deg 18% 8% / 1)",
    bgEnd: "hsl(24deg 14% 6% / 1)",
    glowA: "hsl(196deg 31% 40% / 0.7)",
    glowB: "hsl(18deg 31% 42% / 0.6)",
    glowC: "hsl(292deg 19% 39% / 0.56)",
    glowD: "hsl(82deg 20% 40% / 0.48)",
    glowE: "hsl(226deg 19% 36% / 0.44)",
    saturation: 0.88,
    noiseOpacity: 0.6,
  },
  {
    center: "hsl(226deg 22% 18% / 0.33)",
    bgStart: "hsl(224deg 24% 5% / 1)",
    bgMid: "hsl(250deg 17% 8% / 1)",
    bgEnd: "hsl(88deg 14% 6% / 1)",
    glowA: "hsl(218deg 31% 42% / 0.7)",
    glowB: "hsl(94deg 22% 38% / 0.58)",
    glowC: "hsl(32deg 27% 43% / 0.54)",
    glowD: "hsl(274deg 19% 38% / 0.5)",
    glowE: "hsl(176deg 18% 34% / 0.44)",
    saturation: 0.86,
    noiseOpacity: 0.58,
  },
  {
    center: "hsl(338deg 18% 18% / 0.34)",
    bgStart: "hsl(336deg 20% 5% / 1)",
    bgMid: "hsl(154deg 16% 7% / 1)",
    bgEnd: "hsl(38deg 14% 6% / 1)",
    glowA: "hsl(342deg 29% 39% / 0.68)",
    glowB: "hsl(148deg 22% 36% / 0.58)",
    glowC: "hsl(36deg 24% 43% / 0.52)",
    glowD: "hsl(222deg 18% 36% / 0.48)",
    glowE: "hsl(282deg 17% 36% / 0.42)",
    saturation: 0.86,
    noiseOpacity: 0.61,
  },
  {
    center: "hsl(288deg 17% 18% / 0.34)",
    bgStart: "hsl(282deg 20% 5% / 1)",
    bgMid: "hsl(214deg 16% 8% / 1)",
    bgEnd: "hsl(48deg 12% 6% / 1)",
    glowA: "hsl(286deg 23% 39% / 0.68)",
    glowB: "hsl(210deg 22% 39% / 0.58)",
    glowC: "hsl(42deg 24% 44% / 0.52)",
    glowD: "hsl(136deg 18% 36% / 0.46)",
    glowE: "hsl(332deg 18% 37% / 0.42)",
    saturation: 0.84,
    noiseOpacity: 0.59,
  },
  {
    center: "hsl(164deg 18% 18% / 0.34)",
    bgStart: "hsl(190deg 18% 5% / 1)",
    bgMid: "hsl(148deg 14% 7% / 1)",
    bgEnd: "hsl(316deg 13% 6% / 1)",
    glowA: "hsl(166deg 25% 41% / 0.66)",
    glowB: "hsl(26deg 25% 41% / 0.56)",
    glowC: "hsl(314deg 18% 38% / 0.5)",
    glowD: "hsl(210deg 18% 37% / 0.46)",
    glowE: "hsl(74deg 17% 38% / 0.42)",
    saturation: 0.84,
    noiseOpacity: 0.6,
  },
  {
    center: "hsl(238deg 18% 18% / 0.33)",
    bgStart: "hsl(228deg 22% 5% / 1)",
    bgMid: "hsl(268deg 15% 8% / 1)",
    bgEnd: "hsl(54deg 12% 6% / 1)",
    glowA: "hsl(232deg 26% 41% / 0.68)",
    glowB: "hsl(274deg 20% 40% / 0.58)",
    glowC: "hsl(44deg 25% 44% / 0.54)",
    glowD: "hsl(170deg 18% 35% / 0.46)",
    glowE: "hsl(350deg 17% 37% / 0.42)",
    saturation: 0.86,
    noiseOpacity: 0.57,
  },
  {
    center: "hsl(184deg 18% 18% / 0.34)",
    bgStart: "hsl(186deg 22% 5% / 1)",
    bgMid: "hsl(332deg 15% 7% / 1)",
    bgEnd: "hsl(110deg 13% 6% / 1)",
    glowA: "hsl(184deg 28% 39% / 0.68)",
    glowB: "hsl(340deg 24% 39% / 0.56)",
    glowC: "hsl(96deg 20% 38% / 0.5)",
    glowD: "hsl(28deg 23% 42% / 0.48)",
    glowE: "hsl(226deg 17% 35% / 0.42)",
    saturation: 0.85,
    noiseOpacity: 0.6,
  },
  {
    center: "hsl(330deg 15% 18% / 0.32)",
    bgStart: "hsl(218deg 17% 5% / 1)",
    bgMid: "hsl(328deg 14% 8% / 1)",
    bgEnd: "hsl(198deg 14% 6% / 1)",
    glowA: "hsl(334deg 22% 41% / 0.62)",
    glowB: "hsl(212deg 24% 39% / 0.56)",
    glowC: "hsl(126deg 16% 36% / 0.46)",
    glowD: "hsl(32deg 20% 41% / 0.44)",
    glowE: "hsl(272deg 15% 36% / 0.4)",
    saturation: 0.82,
    noiseOpacity: 0.61,
  },
  {
    center: "hsl(150deg 18% 18% / 0.34)",
    bgStart: "hsl(154deg 22% 5% / 1)",
    bgMid: "hsl(288deg 15% 8% / 1)",
    bgEnd: "hsl(26deg 14% 6% / 1)",
    glowA: "hsl(148deg 24% 38% / 0.66)",
    glowB: "hsl(286deg 20% 39% / 0.58)",
    glowC: "hsl(22deg 27% 42% / 0.54)",
    glowD: "hsl(204deg 18% 36% / 0.46)",
    glowE: "hsl(58deg 16% 38% / 0.42)",
    saturation: 0.84,
    noiseOpacity: 0.59,
  },
  {
    center: "hsl(214deg 17% 18% / 0.33)",
    bgStart: "hsl(218deg 23% 5% / 1)",
    bgMid: "hsl(202deg 16% 8% / 1)",
    bgEnd: "hsl(272deg 13% 6% / 1)",
    glowA: "hsl(210deg 24% 40% / 0.66)",
    glowB: "hsl(262deg 18% 40% / 0.56)",
    glowC: "hsl(18deg 20% 40% / 0.46)",
    glowD: "hsl(156deg 17% 35% / 0.42)",
    glowE: "hsl(44deg 17% 39% / 0.4)",
    saturation: 0.82,
    noiseOpacity: 0.58,
  },
  {
    center: "hsl(92deg 15% 18% / 0.32)",
    bgStart: "hsl(96deg 18% 5% / 1)",
    bgMid: "hsl(18deg 14% 7% / 1)",
    bgEnd: "hsl(222deg 16% 6% / 1)",
    glowA: "hsl(92deg 21% 38% / 0.62)",
    glowB: "hsl(18deg 25% 41% / 0.54)",
    glowC: "hsl(224deg 20% 38% / 0.5)",
    glowD: "hsl(304deg 15% 36% / 0.42)",
    glowE: "hsl(174deg 16% 34% / 0.4)",
    saturation: 0.82,
    noiseOpacity: 0.6,
  },
];

function hashSeed(seed: string) {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getPosition(hash: number, shift: number, x: number, y: number) {
  const dx = (((hash >>> shift) & 15) - 7.5) * 0.9;
  const dy = (((hash >>> (shift + 4)) & 15) - 7.5) * 0.9;

  return `${clamp(x + dx, 10, 90).toFixed(1)}% ${clamp(
    y + dy,
    10,
    90
  ).toFixed(1)}%`;
}

function getCoverStyle(
  seed: string | null | undefined
): CollectionCoverPlaceholderStyle | undefined {
  if (!seed) return undefined;

  const hash = hashSeed(seed);
  const paletteIndex = ((hash ^ (hash >>> 16)) >>> 0) % COVER_PALETTES.length;
  const palette = COVER_PALETTES[paletteIndex];

  return {
    "--collection-cover-bg-center": palette.center,
    "--collection-cover-bg-start": palette.bgStart,
    "--collection-cover-bg-mid": palette.bgMid,
    "--collection-cover-bg-end": palette.bgEnd,
    "--collection-cover-glow-a": palette.glowA,
    "--collection-cover-glow-b": palette.glowB,
    "--collection-cover-glow-c": palette.glowC,
    "--collection-cover-glow-d": palette.glowD,
    "--collection-cover-glow-e": palette.glowE,
    "--collection-cover-pos-a": getPosition(hash, 0, 24, 20),
    "--collection-cover-pos-b": getPosition(hash, 4, 76, 18),
    "--collection-cover-pos-c": getPosition(hash, 8, 78, 78),
    "--collection-cover-pos-d": getPosition(hash, 12, 18, 78),
    "--collection-cover-pos-e": getPosition(hash, 16, 50, 54),
    "--collection-cover-rotation": `${((hash >>> 4) % 19) - 9}deg`,
    "--collection-cover-scale": `${1.12 + ((hash >>> 9) % 9) / 100}`,
    "--collection-cover-saturation": `${palette.saturation + ((hash >>> 13) % 5) / 100}`,
    "--collection-cover-noise-opacity": `${palette.noiseOpacity}`,
  };
}

export default function CollectionCoverPlaceholder({
  seed,
  className,
  style,
}: CollectionCoverPlaceholderProps) {
  return (
    <div
      className={["collection-cover-placeholder", className]
        .filter(Boolean)
        .join(" ")}
      style={{ ...getCoverStyle(seed), ...style }}
      aria-hidden="true"
    />
  );
}
