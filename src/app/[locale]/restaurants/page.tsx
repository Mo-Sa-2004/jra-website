import { getTranslations, setRequestLocale } from "next-intl/server";
import { RestaurantCard } from "@/components/restaurant-card";
import { DirectorySidebar } from "@/components/directory-sidebar";
import { RestaurantSearchBand } from "@/components/restaurant-search-band";
import { RestaurantsPromoBand } from "@/components/restaurants-promo-band";
import { Pagination } from "@/components/pagination";
import { searchRestaurants, getDirectoryFacets } from "@/lib/restaurants";
import { pageMetadata } from "@/lib/page-metadata";

// Search/pagination is entirely driven by the URL query string; force this
// route to always render fresh server-side rather than risk the client
// router cache serving a previous page's results until a hard refresh.
export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  governorate?: string;
  /** Comma-joined list of cuisine slugs -- the sidebar is now a checkbox
   *  list, so more than one can be selected at once. */
  cuisine?: string;
  stars?: string;
  page?: string;
};

export const generateMetadata = pageMetadata("/restaurants", "directory");

/**
 * Rebuilt to match the client's reference directory (a dark "Find a
 * Restaurant" search band, a promo/newsletter strip, then a sidebar of
 * filters next to the result grid) in JRA's own blue/white/gray rather
 * than the reference's teal/pink/yellow. The underlying search (`q`,
 * `governorate`, `cuisine`, pagination) is the same mechanism the old
 * horizontal filter bar used -- only the layout and the cuisine filter
 * (single-select -> checkbox list) changed. See `directory-sidebar.tsx`,
 * `restaurant-search-band.tsx` and `restaurants-promo-band.tsx`.
 */
export default async function RestaurantsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const cuisineSlugs = sp.cuisine ? sp.cuisine.split(",").filter(Boolean) : [];

  const [t, tCommon, facets, results] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
    getDirectoryFacets(),
    searchRestaurants({
      q: sp.q,
      governorate: sp.governorate,
      cuisine: cuisineSlugs,
      stars: sp.stars ? Number(sp.stars) : undefined,
      page: sp.page ? Number(sp.page) : 1,
    }),
  ]);

  return (
    <div>
      <RestaurantSearchBand governorates={facets.governorates} />
      <RestaurantsPromoBand />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
          <DirectorySidebar
            governorates={facets.governorates}
            cuisines={facets.cuisines}
            current={sp}
          />

          <div>
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-ink">
              {t("restaurants")}
            </h2>
            <div className="mt-2 text-sm text-ink-faint">
              <span key={results.total} className="count-fade">
                {results.total} {results.total === 1 ? tCommon("result") : tCommon("results")}
              </span>
            </div>

            {results.items.length === 0 ? (
              <p className="mt-16 text-center text-ink-soft">{tCommon("noResults")}</p>
            ) : (
              <div className="stagger mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {results.items.map((r) => (
                  <div key={r.slug}>
                    <RestaurantCard restaurant={r} />
                  </div>
                ))}
              </div>
            )}

            <Pagination
              basePath="/restaurants"
              current={results.page}
              total={results.totalPages}
              params={{ q: sp.q, governorate: sp.governorate, cuisine: sp.cuisine, stars: sp.stars }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
