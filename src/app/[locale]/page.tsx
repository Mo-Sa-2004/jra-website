import { setRequestLocale } from "next-intl/server";
import { AudienceGate } from "@/components/home/audience-gate";

/**
 * The homepage is a hard audience gate: this page renders nothing but
 * `AudienceGate`'s three circular tiles. Everything that used to live here
 * — the new-member carousel, search, Quick Access, stats, news, the map,
 * the newsletter — moved to one of the dedicated per-audience homepages:
 *   - `/discover`   — the public looking for a restaurant
 *   - `/for-members` — restaurant/hospitality businesses dealing with JRA
 *   - `/jobs`        — hands off to SiyahaJobs for job seekers
 *
 * Rebuilt November 2026 to match the client's unified-identity reference
 * (see audience-gate.tsx). That redesign swapped the previous 6-photo
 * member-image grid per tile for one static brand photo per circle, so
 * this page no longer needs to query restaurants/suppliers for images —
 * it's now fully static per locale, no database round trip on render.
 */
export default async function GatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AudienceGate />;
}
