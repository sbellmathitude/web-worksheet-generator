/**
 * Each pattern is a 10x10 grid of palette tokens so new level-specific reward
 * libraries can swap in different token grids later without changing the UI.
 */
export type PixelToken =
  | "blank"
  | "ink"
  | "sun"
  | "sky"
  | "grass"
  | "leaf"
  | "trunk"
  | "rose"
  | "violet"
  | "mint"
  | "sand"
  | "ocean"
  | "coral"
  | "gold";

export type PixelArtPattern = {
  id: string;
  label: string;
  pixels: ReadonlyArray<ReadonlyArray<PixelToken>>;
};

export const PIXEL_ART_COLUMNS = 10;
export const PIXEL_ART_ROWS = 10;

export const PIXEL_TOKEN_COLORS: Record<PixelToken, string> = {
  blank: "#f8fafc",
  ink: "#1f2937",
  sun: "#fbbf24",
  sky: "#bfdbfe",
  grass: "#86efac",
  leaf: "#22c55e",
  trunk: "#92400e",
  rose: "#fb7185",
  violet: "#8b5cf6",
  mint: "#99f6e4",
  sand: "#fde68a",
  ocean: "#38bdf8",
  coral: "#fb923c",
  gold: "#f59e0b",
};

const row = (...tokens: PixelToken[]) => tokens;

export const PIXEL_ART_PATTERNS: ReadonlyArray<PixelArtPattern> = [
  {
    id: "smiley",
    label: "smiley face",
    pixels: [
      row("blank", "blank", "sun", "sun", "sun", "sun", "sun", "sun", "blank", "blank"),
      row("blank", "sun", "sun", "sun", "sun", "sun", "sun", "sun", "sun", "blank"),
      row("sun", "sun", "sun", "ink", "sun", "sun", "ink", "sun", "sun", "sun"),
      row("sun", "sun", "sun", "ink", "sun", "sun", "ink", "sun", "sun", "sun"),
      row("sun", "sun", "sun", "sun", "sun", "sun", "sun", "sun", "sun", "sun"),
      row("sun", "ink", "sun", "sun", "sun", "sun", "sun", "sun", "ink", "sun"),
      row("sun", "sun", "ink", "ink", "ink", "ink", "ink", "ink", "sun", "sun"),
      row("blank", "sun", "sun", "sun", "sun", "sun", "sun", "sun", "sun", "blank"),
      row("blank", "blank", "sun", "sun", "sun", "sun", "sun", "sun", "blank", "blank"),
      row("blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank"),
    ],
  },
  {
    id: "heart",
    label: "heart",
    pixels: [
      row("blank", "rose", "rose", "blank", "blank", "blank", "blank", "rose", "rose", "blank"),
      row("rose", "rose", "rose", "rose", "blank", "blank", "rose", "rose", "rose", "rose"),
      row("rose", "rose", "rose", "rose", "rose", "rose", "rose", "rose", "rose", "rose"),
      row("blank", "rose", "rose", "rose", "rose", "rose", "rose", "rose", "rose", "blank"),
      row("blank", "blank", "rose", "rose", "rose", "rose", "rose", "rose", "blank", "blank"),
      row("blank", "blank", "blank", "rose", "rose", "rose", "rose", "blank", "blank", "blank"),
      row("blank", "blank", "blank", "blank", "rose", "rose", "blank", "blank", "blank", "blank"),
      row("blank", "blank", "blank", "blank", "rose", "rose", "blank", "blank", "blank", "blank"),
      row("blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank"),
      row("blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank", "blank"),
    ],
  },
  {
    id: "star",
    label: "star",
    pixels: [
      row("sky", "sky", "sky", "sky", "gold", "gold", "sky", "sky", "sky", "sky"),
      row("sky", "sky", "sky", "sky", "gold", "gold", "sky", "sky", "sky", "sky"),
      row("sky", "gold", "sky", "sky", "gold", "gold", "sky", "sky", "gold", "sky"),
      row("sky", "sky", "gold", "sky", "gold", "gold", "sky", "gold", "sky", "sky"),
      row("sky", "sky", "sky", "gold", "gold", "gold", "gold", "sky", "sky", "sky"),
      row("gold", "gold", "gold", "gold", "gold", "gold", "gold", "gold", "gold", "gold"),
      row("sky", "sky", "sky", "gold", "gold", "gold", "gold", "sky", "sky", "sky"),
      row("sky", "sky", "gold", "sky", "gold", "gold", "sky", "gold", "sky", "sky"),
      row("sky", "gold", "sky", "sky", "gold", "gold", "sky", "sky", "gold", "sky"),
      row("sky", "sky", "sky", "sky", "gold", "gold", "sky", "sky", "sky", "sky"),
    ],
  },
  {
    id: "flower",
    label: "flower",
    pixels: [
      row("mint", "mint", "mint", "mint", "rose", "rose", "mint", "mint", "mint", "mint"),
      row("mint", "mint", "rose", "rose", "rose", "rose", "rose", "rose", "mint", "mint"),
      row("mint", "rose", "rose", "sun", "sun", "sun", "sun", "rose", "rose", "mint"),
      row("mint", "rose", "sun", "sun", "sun", "sun", "sun", "sun", "rose", "mint"),
      row("mint", "rose", "sun", "sun", "sun", "sun", "sun", "sun", "rose", "mint"),
      row("mint", "mint", "mint", "mint", "leaf", "leaf", "mint", "mint", "mint", "mint"),
      row("mint", "mint", "mint", "mint", "leaf", "leaf", "mint", "mint", "mint", "mint"),
      row("mint", "mint", "mint", "leaf", "leaf", "leaf", "leaf", "mint", "mint", "mint"),
      row("mint", "mint", "leaf", "leaf", "trunk", "trunk", "leaf", "leaf", "mint", "mint"),
      row("mint", "leaf", "leaf", "mint", "trunk", "trunk", "mint", "leaf", "leaf", "mint"),
    ],
  },
  {
    id: "rocket",
    label: "rocket",
    pixels: [
      row("sky", "sky", "sky", "sky", "coral", "coral", "sky", "sky", "sky", "sky"),
      row("sky", "sky", "sky", "coral", "coral", "coral", "coral", "sky", "sky", "sky"),
      row("sky", "sky", "sky", "coral", "mint", "mint", "coral", "sky", "sky", "sky"),
      row("sky", "sky", "coral", "coral", "mint", "mint", "coral", "coral", "sky", "sky"),
      row("sky", "sky", "coral", "coral", "coral", "coral", "coral", "coral", "sky", "sky"),
      row("sky", "coral", "coral", "coral", "coral", "coral", "coral", "coral", "coral", "sky"),
      row("sky", "sky", "coral", "coral", "coral", "coral", "coral", "coral", "sky", "sky"),
      row("sky", "sky", "sky", "coral", "gold", "gold", "coral", "sky", "sky", "sky"),
      row("sky", "sky", "coral", "gold", "gold", "gold", "gold", "coral", "sky", "sky"),
      row("sky", "coral", "gold", "gold", "blank", "blank", "gold", "gold", "coral", "sky"),
    ],
  },
  {
    id: "shell",
    label: "seashell",
    pixels: [
      row("ocean", "ocean", "ocean", "sand", "sand", "sand", "sand", "ocean", "ocean", "ocean"),
      row("ocean", "ocean", "sand", "sand", "coral", "coral", "sand", "sand", "ocean", "ocean"),
      row("ocean", "sand", "sand", "coral", "coral", "coral", "coral", "sand", "sand", "ocean"),
      row("sand", "sand", "coral", "coral", "rose", "rose", "coral", "coral", "sand", "sand"),
      row("sand", "coral", "coral", "rose", "rose", "rose", "rose", "coral", "coral", "sand"),
      row("sand", "coral", "rose", "rose", "violet", "violet", "rose", "rose", "coral", "sand"),
      row("sand", "coral", "coral", "rose", "rose", "rose", "rose", "coral", "coral", "sand"),
      row("ocean", "sand", "coral", "coral", "coral", "coral", "coral", "coral", "sand", "ocean"),
      row("ocean", "ocean", "sand", "sand", "coral", "coral", "sand", "sand", "ocean", "ocean"),
      row("ocean", "ocean", "ocean", "sand", "sand", "sand", "sand", "ocean", "ocean", "ocean"),
    ],
  },
];

export function getRandomPixelArtPattern() {
  return PIXEL_ART_PATTERNS[Math.floor(Math.random() * PIXEL_ART_PATTERNS.length)];
}

export function getRewardPixelToken(pattern: PixelArtPattern, index: number): PixelToken {
  const rowIndex = Math.floor(index / PIXEL_ART_COLUMNS);
  const columnIndex = index % PIXEL_ART_COLUMNS;
  return pattern.pixels[rowIndex]?.[columnIndex] ?? "blank";
}
