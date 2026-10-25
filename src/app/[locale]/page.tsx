import { setRequestLocale } from "next-intl/server";
import { AudienceGate } from "@/components/home/audience-gate";
import { db } from "@/lib/db";

// Cached and revalidated every 300s. Set per route since the site-wide
// force-dynamic was removed from the locale layout (blueprint §4.2).
export const revalidate = 300;

/**
 * The homepage is now a hard audience gate, per the client's explicit
 * request to match rans.ca's "For Foodie" / "For Business" split: this page
 * renders nothing but the two tiles. Everything that used to live here —
 * the new-member carousel, search, Quick Access, stats, news, the map,
 * the newsletter — moved to one of two dedicated homepages, split by
 * audience:
 *   - `/discover`   — the public looking for a restaurant
 *   - `/for-members` — restaurant/hospitality businesses dealing with JRA
 *
 * `middleware.ts` is what makes this a one-time choice rather than a wall
 * on every visit: once a visitor picks a tile (via `[locale]/gate/route.ts`,
 * which sets a cookie), later visits to this exact URL redirect straight to
 * their side. A deep link to any other page — /restaurants, /membership,
 * anything — always works regardless of which side was picked; only this
 * bare homepage gates.
 */
export default async function GatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Two distinct real member photos, not stock imagery.
  const newMembers = await db.restaurant.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 2,
    select: {
      name: true,
      nameAr: true,
      images: { where: { isPrimary: true }, take: 1, select: { url: true } },
    },
  });

  const gateImage = (r: (typeof newMembers)[number] | undefined) =>
    r?.images[0]?.url
      ? { url: r.images[0].url, alt: (locale === "ar" && r.nameAr) || r.name }
      : null;

  return (
    <AudienceGate
      dinerImage={gateImage(newMembers[0])}
      memberImage={gateImage(newMembers[1]) ?? gateImage(newMembers[0])}
    />
  );
}
