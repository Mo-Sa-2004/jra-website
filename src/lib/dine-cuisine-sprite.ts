/**
 * Maps a cuisine's English name to its position in the designer's cuisine
 * icon sprite (`/public/brand/dine-cuisine-sprite.webp`, from the handover
 * package's `dine-cuisine-reference.png` + the `--x` values in
 * `dine-data.js`). The sprite only has icons for ~20 named cuisines; real
 * JRA cuisine records are seeded from the association's own spreadsheets
 * and don't share a slug format with the designer's sample data, so this
 * matches by keyword against the English name instead of relying on an
 * exact slug match, and anything that doesn't match falls back to the
 * sprite's own "Others" icon rather than leaving a blank circle.
 */
const CUISINE_SPRITE_X: { keywords: string[]; x: number }[] = [
  { keywords: ["lebanese"], x: 7.95833 },
  { keywords: ["jordanian", "local"], x: 4.7 },
  { keywords: ["international"], x: 7.95833 },
  { keywords: ["italian"], x: 6.30833 },
  { keywords: ["chinese"], x: 6.30833 },
  { keywords: ["bakery", "bakeries", "patisserie"], x: 6.30833 },
  { keywords: ["seafood"], x: 9.725 },
  { keywords: ["steakhouse", "steak"], x: 4.7 },
  { keywords: ["american"], x: 4.7 },
  { keywords: ["french"], x: 6.30833 },
  { keywords: ["fast food", "fast-food", "quick service"], x: 4.7 },
  { keywords: ["pizza"], x: 6.30833 },
  { keywords: ["japanese", "sushi"], x: 9.725 },
  { keywords: ["health"], x: 7.95833 },
  { keywords: ["indian"], x: 4.7 },
  { keywords: ["coffee", "cafe", "café"], x: 11.39167 },
  { keywords: ["portuguese"], x: 9.725 },
  { keywords: ["iraqi"], x: 4.7 },
  { keywords: ["turkish"], x: 4.7 },
  { keywords: ["yemeni", "yemini"], x: 4.7 },
  { keywords: ["thai"], x: 6.30833 },
];

const OTHERS_X = 7.95833;

export function cuisineSpriteX(nameEn: string): number {
  const normalized = nameEn.toLowerCase();
  for (const entry of CUISINE_SPRITE_X) {
    if (entry.keywords.some((k) => normalized.includes(k))) return entry.x;
  }
  return OTHERS_X;
}
