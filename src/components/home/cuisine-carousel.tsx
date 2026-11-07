"use client";

import { useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cuisineSpriteX } from "@/lib/dine-cuisine-sprite";

export type DineCuisine = { slug: string; nameEn: string; nameAr: string | null };

/**
 * Horizontally-scrolling row of cuisine icons under the Dine Jordan hero,
 * matching the designer's "Explore by Cuisine" carousel — real JRA
 * cuisines (facets.cuisines) rather than the designer's own sample list,
 * each linking into the real restaurant directory pre-filtered to it.
 *
 * The reference implementation pages the strip with dot indicators; this
 * keeps the prev/next arrows (the primary way to move it) and relies on
 * native scroll-snap for everything else, since the dots track a fixed
 * page size the designer's static 22-item list could assume but a live,
 * growing cuisine list can't.
 */
export function CuisineCarousel({ cuisines }: { cuisines: DineCuisine[] }) {
  const t = useTranslations("home");
  const locale = useLocale();
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByAmount(dir: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const amount = track.clientWidth * 0.8 * dir * (locale === "ar" ? -1 : 1);
    track.scrollBy({ left: amount, behavior: "smooth" });
  }

  if (cuisines.length === 0) return null;

  return (
    <div className="dine-cuisine-row">
      <button
        type="button"
        className="dine-cuisine-arrow"
        onClick={() => scrollByAmount(-1)}
        aria-label={t("cuisinePrevious")}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      <div ref={trackRef} className="dine-cuisine-track" aria-label={t("exploreByCuisine")}>
        {cuisines.map((c) => (
          <Link
            key={c.slug}
            href={`/restaurants?cuisine=${c.slug}`}
            className="dine-cuisine-choice"
          >
            <span
              className="dine-cuisine-photo"
              style={{ "--dine-cuisine-x": cuisineSpriteX(c.nameEn) } as React.CSSProperties}
              aria-hidden="true"
            />
            <span>{locale === "ar" && c.nameAr ? c.nameAr : c.nameEn}</span>
          </Link>
        ))}
      </div>

      <button
        type="button"
        className="dine-cuisine-arrow"
        onClick={() => scrollByAmount(1)}
        aria-label={t("cuisineNext")}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
