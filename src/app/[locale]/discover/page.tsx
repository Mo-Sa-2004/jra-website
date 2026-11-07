import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarDays, MapPin, ArrowUpRight, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CoverThumb } from "@/components/cover-thumb";
import { DiscoverHero } from "@/components/home/discover-hero";
import { CuisineCarousel } from "@/components/home/cuisine-carousel";
import { NewsletterForm } from "@/components/newsletter-form";
import { ORG } from "@/lib/organisation";
import { db } from "@/lib/db";
import { getDirectoryFacets } from "@/lib/restaurants";
import { pageMetadata } from "@/lib/page-metadata";

export const revalidate = 300;

export const generateMetadata = pageMetadata("/discover", "discover");

/**
 * Rebuilt to match the designer's "Dine Jordan" reference package
 * (restaurants.html / dine-shell.css in the November 2026 handover): the
 * shared hero with its dual circular photos and pill search panel
 * (`DiscoverHero`), three rectangular gateway cards into Restaurants /
 * Events / News, and a horizontally-scrolling cuisine carousel — all using
 * real JRA data (the directory's actual restaurants/events/news and
 * cuisine list) rather than the designer's own sample content. Below that,
 * this keeps real sections the reference page itself doesn't need (it
 * links out to separate restaurants.html/events/news views instead): an
 * upcoming-events strip, a member-photo section standing in for a live
 * Instagram embed JRA has no API access wired up here for, and the
 * newsletter signup.
 */
export default async function DiscoverPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");
  const tNav = await getTranslations("nav");
  const tEvents = await getTranslations("events");

  const [topRestaurants, upcomingEventsPool, latestNewsPool, facets] = await Promise.all([
    db.restaurant.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ sustainabilityScore: "desc" }, { createdAt: "desc" }],
      take: 9,
      include: {
        // No `where: { isPrimary: true }` -- most listings have never had
        // one flagged (see cover-thumb.tsx's own note on how rare cover
        // images are), which made every card here fall straight to
        // CoverThumb's empty state. `lib/restaurants.ts`'s own
        // `toCardData` -- used everywhere real photos *do* show up --
        // takes the flagged image or, failing that, the first by
        // `sortOrder`; this matches that instead of requiring the flag.
        images: { orderBy: { sortOrder: "asc" } },
        governorate: true,
      },
    }),
    db.event.findMany({
      where: { status: "PUBLISHED", startAt: { gte: new Date() } },
      orderBy: { startAt: "asc" },
      take: 6,
      include: { translations: { where: { locale: locale === "ar" ? "ar" : "en" } } },
    }),
    db.newsArticle.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 5,
      include: { translations: { where: { locale: locale === "ar" ? "ar" : "en" } } },
    }),
    getDirectoryFacets(),
  ]);

  // The Restaurants gateway card links to the general directory, not to any
  // one restaurant, so nothing forces it to picture the single top-ranked
  // listing -- it just needs a photo. Prefer the first of the top 9 that
  // actually has one uploaded (primary flag, or first by sortOrder) over
  // forcing in #1 by score even when #1 turns out to have none.
  const restaurantWithImage = topRestaurants.find((r) => r.images.length > 0);
  const featuredRestaurantImage = restaurantWithImage
    ? (restaurantWithImage.images.find((i) => i.isPrimary)?.url ?? restaurantWithImage.images[0]?.url ?? null)
    : null;
  const featuredRestaurant = restaurantWithImage ?? topRestaurants[0];
  const galleryRestaurants = topRestaurants.filter((r) => r.slug !== featuredRestaurant?.slug).slice(0, 8);

  // The upcoming-events strip below still shows the true three soonest
  // events, in order, regardless of photos. The gateway card is a
  // photo-forward format though, so it prefers whichever of the next few
  // events or articles actually has a cover photo over forcing in the
  // single soonest/latest record when that one happens to have none.
  const upcomingEvents = upcomingEventsPool.slice(0, 3);
  const gatewayEvent = upcomingEventsPool.find((e) => e.coverImageUrl) ?? upcomingEventsPool[0];
  const gatewayNews = latestNewsPool.find((n) => n.coverImageUrl) ?? latestNewsPool[0];

  return (
    <div>
      <DiscoverHero governorates={facets.governorates} cuisines={facets.cuisines} />

      {/* Three rectangular gateway cards into Restaurants / Events / News,
          matching the reference's own `.gateway-card` row -- real cover
          photos from the directory's actual top restaurant, next event and
          latest article, with `CoverThumb`'s existing empty-state handling
          for whichever of the three has none yet. */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:px-8">
        <div className="dine-gateway">
          {[
            {
              key: "restaurants",
              href: "/restaurants",
              label: tNav("restaurants"),
              image: featuredRestaurantImage,
              seed: featuredRestaurant?.slug ?? "restaurants",
            },
            {
              key: "events",
              href: "/events",
              label: tEvents("title"),
              image: gatewayEvent?.coverImageUrl ?? null,
              seed: gatewayEvent?.slug ?? "events",
            },
            {
              key: "news",
              href: "/news",
              label: tNav("news"),
              image: gatewayNews?.coverImageUrl ?? null,
              seed: gatewayNews?.slug ?? "news",
            },
          ].map((card) => (
            <Link key={card.key} href={card.href} className="dine-gateway-card">
              <CoverThumb
                url={card.image}
                alt=""
                seed={card.seed}
                title={card.label}
                sizes="(min-width: 640px) 33vw, 100vw"
                aspect="h-full w-full"
              />
              <span className="dine-gateway-label">{card.label}</span>
              <span className="dine-gateway-arrow" aria-hidden="true">
                <ArrowRight className="h-5 w-5 rtl:-scale-x-100" />
              </span>
            </Link>
          ))}
        </div>

        {/* Explore by Cuisine -- real JRA cuisines, not the designer's own
            sample list (see cuisine-carousel.tsx). */}
        <div className="mt-12">
          <h2 className="mb-4 font-display text-2xl font-bold text-ink">{t("exploreByCuisine")}</h2>
          <CuisineCarousel cuisines={facets.cuisines} />
        </div>
      </section>

      {/* Switch sides — small and out of the way, for the rare visitor who
          picked the wrong tile on the gate. */}
      <div className="border-b border-rule bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
          <Link
            href="/for-members"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent"
          >
            {t("gateSwitchToMember")}
            <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {upcomingEvents.length > 0 ? (
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-ink">
              {tEvents("title")}
            </h2>
            <Link href="/events" className="text-sm font-medium text-accent">
              {tCommon("viewAll")} →
            </Link>
          </div>

          <div className="stagger mt-8 grid gap-6 sm:grid-cols-3">
            {upcomingEvents.map((e) => (
              <Link
                key={e.id}
                href="/events"
                className="motion-card group overflow-hidden rounded-2xl border border-rule bg-surface"
              >
                <CoverThumb
                  url={e.coverImageUrl}
                  alt=""
                  seed={e.slug}
                  title={e.translations[0]?.title ?? e.slug}
                  sizes="(min-width: 640px) 33vw, 100vw"
                  aspect="aspect-[4/3]"
                />
                <div className="p-5">
                  <time className="ui-caps text-xs font-semibold text-accent">
                    {e.startAt.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" })}
                  </time>
                  <h3 className="mt-1.5 font-display font-semibold text-lg text-ink group-hover:text-accent">
                    {e.translations[0]?.title ?? e.slug}
                  </h3>
                  {e.locationText ? (
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-soft">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
                      {e.locationText}
                    </p>
                  ) : null}
                  <span className="mt-4 flex items-center gap-1 text-sm font-medium text-accent">
                    {tEvents("info")}
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Stands in for the reference's live Instagram embed -- JRA's real
          member photos rather than a feed this environment can't pull
          from, with real links out to JRA's own accounts underneath. */}
      {galleryRestaurants.length > 0 ? (
        <section className="bg-accent">
          <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
              {t("discoverSocialTitle")}
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-white/80">{t("discoverSocialBody")}</p>

            <div className="stagger mt-8 grid grid-cols-4 gap-2 sm:gap-3">
              {galleryRestaurants.map((r) => (
                <Link
                  key={r.slug}
                  href={`/restaurants/${r.slug}`}
                  className="motion-card overflow-hidden rounded-lg"
                >
                  <CoverThumb
                    url={r.images.find((i) => i.isPrimary)?.url ?? r.images[0]?.url ?? null}
                    alt=""
                    seed={r.slug}
                    title={r.name}
                    sizes="(min-width: 640px) 12vw, 25vw"
                    aspect="aspect-square"
                  />
                </Link>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {ORG.social.map(({ key, label, url }) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-accent transition-colors hover:bg-white/90"
                >
                  {t("discoverFollowUs")} {label}
                </a>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-t border-rule bg-ink">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 md:py-24">
          <h2 className="font-display font-semibold text-3xl text-paper sm:text-4xl">
            {t("newsletterTitle")}
          </h2>
          <p className="mt-3 text-paper/70">{t("newsletterSubtitle")}</p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
