import { getTranslations } from "next-intl/server";
import { MapPin, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CoverThumb } from "@/components/cover-thumb";

export type BannerRestaurant = {
  slug: string;
  name: string;
  imageUrl: string | null;
  location: string | null;
  isNew: boolean;
};

/**
 * "02 DYNAMIC NEW MEMBER RESTAURANTS BANNER" from the client's wireframe —
 * now a photo-grid mosaic rather than a single full-bleed auto-rotating
 * image. The original version stretched one restaurant's primary photo
 * across a ~1800x460 box with object-cover; for restaurants whose only
 * photo on file is a small square logo (common — see the document-migration
 * and photo-quality work), that upscale-and-crop is exactly what produced
 * the visible blur the client flagged. A grid of smaller cards hides a
 * low-res source far better than one giant crop ever could, and it reads
 * closer to the multi-photo "wall" look the client pointed to for the
 * audience-gate tiles (see `audience-gate.tsx`) — same visual idea, applied
 * here too, for consistency between the two.
 *
 * Plain async server component now, same shape as `AudienceGate` — the old
 * version carried client-side carousel state (an interval timer, manual
 * prev/next, dot nav) purely to show one restaurant at a time. A grid shows
 * several at once, so none of that is needed: one less "use client"
 * boundary, lighter bundle, no hydration work for what's otherwise static
 * content.
 */
export async function NewMemberBanner({ restaurants }: { restaurants: BannerRestaurant[] }) {
  if (restaurants.length === 0) return null;

  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");

  return (
    <section aria-label={t("newMemberBanner")} className="border-b border-rule bg-canvas-deep">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-8 md:py-16">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
            {t("newMemberBanner")}
          </h2>
          <Link
            href="/restaurants"
            className="text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            {tCommon("viewAll")} →
          </Link>
        </div>

        <div className="stagger mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {restaurants.slice(0, 8).map((r, i) => (
            <Link
              key={r.slug}
              href={`/restaurants/${r.slug}`}
              className="motion-card group overflow-hidden rounded-2xl border border-white/10 bg-white/5"
            >
              <div className="relative">
                <CoverThumb
                  url={r.imageUrl}
                  alt=""
                  seed={r.slug}
                  title={r.name}
                  sizes="(min-width: 1024px) 23vw, (min-width: 640px) 31vw, 48vw"
                  aspect="aspect-square"
                  priority={i < 4}
                />
                {r.isNew ? (
                  <span className="absolute start-2 top-2 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-white">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    {t("newBadge")}
                  </span>
                ) : null}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-semibold text-white">{r.name}</p>
                {r.location ? (
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-white/60">
                    <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                    {r.location}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
