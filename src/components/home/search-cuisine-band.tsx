import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HeroSearch } from "@/components/home/hero-search";

export type HeroCuisine = { slug: string; label: string; count: number };

/**
 * Search, directly under the New Member Banner carousel.
 *
 * The banner above this is already a full-bleed photo section (real member
 * photography, auto-rotating) — it does the job a marketing hero photo
 * would have done, per the wireframe's own note that it "replaces the
 * previous marketing hero entirely." Stacking a second photo hero under it
 * would just repeat that beat, so this band carries only what the old hero
 * had that the banner doesn't: search as the primary action, and the
 * cuisine strip as a second way in. `bg-canvas-deep` keeps it reading as
 * one continuous dark opening rather than a seam between two sections.
 */
export async function SearchCuisineBand({
  cuisines,
  restaurantCount,
}: {
  cuisines: HeroCuisine[];
  restaurantCount: number;
}) {
  const t = await getTranslations("home");

  return (
    <section className="bg-canvas-deep">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:px-8 md:py-14">
        <div className="mx-auto max-w-xl">
          <HeroSearch />
          <p className="mt-3 text-center text-sm text-white/55">
            {t("heroSearchHint", { count: restaurantCount })}
          </p>
        </div>

        {cuisines.length > 0 ? (
          <nav
            aria-label={t("browseByCuisine")}
            className="mt-10 border-t border-white/15 pt-6"
          >
            <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
              {t("browseByCuisine")}
            </p>
            <ul className="mt-4 flex flex-wrap justify-center gap-2.5">
              {cuisines.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/restaurants?cuisine=${c.slug}`}
                    className="group inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white/80 transition-colors hover:border-accent hover:bg-accent hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <span className="text-sm font-medium">{c.label}</span>
                    <span className="tabular text-xs text-white/50 transition-colors group-hover:text-white/80">
                      {c.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </section>
  );
}
