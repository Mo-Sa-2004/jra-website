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
 * Each gate tile shows a grid of up to 6 real member photos rather than one
 * — see `audience-gate.tsx` for why. The foodie tile draws from published
 * restaurants, the business tile from published suppliers; both are real
 * JRA member data, not stock or third-party imagery.
 */
export default async function GatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [newRestaurants, newSuppliers] = await Promise.all([
    db.restaurant.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        name: true,
        nameAr: true,
        images: { where: { isPrimary: true }, take: 1, select: { url: true } },
      },
    }),
    db.supplier.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        name: true,
        nameAr: true,
        images: { where: { isPrimary: true }, take: 1, select: { url: true } },
      },
    }),
  ]);

  type WithImage = { name: string; nameAr: string | null; images: { url: string }[] };
  const toGateImages = (rows: WithImage[]) =>
    rows.flatMap((r) => {
      const url = r.images[0]?.url;
      if (!url) return [];
      return [{ url, alt: (locale === "ar" && r.nameAr) || r.name }];
    });

  return (
    <AudienceGate
      dinerImages={toGateImages(newRestaurants)}
      memberImages={toGateImages(newSuppliers)}
    />
  );
}
