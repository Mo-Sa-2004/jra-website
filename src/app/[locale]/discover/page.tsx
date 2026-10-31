import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarDays, MapPin, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CoverThumb } from "@/components/cover-thumb";
import { DiscoverHero } from "@/components/home/discover-hero";
import { NewsletterForm } from "@/components/newsletter-form";
import { ORG } from "@/lib/organisation";
import { db } from "@/lib/db";
import { getDirectoryFacets } from "@/lib/restaurants";
import { pageMetadata } from "@/lib/page-metadata";

export const revalidate = 300;

export const generateMetadata = pageMetadata("/discover", "discover");

/**
 * Rebuilt to match the client's reference landing page
 * (https://rans.ca/dinens/) in JRA's blue/white/gray: a full-bleed photo
 * hero with the search band layered on it, a short "Welcome to" blurb, a
 * row of three circular links into the site, an upcoming-events strip, a
 * member-photo section standing in for the reference's live Instagram
 * embed (JRA has no social API access wired up here, so this reuses real
 * member photos from the directory instead, alongside real links to JRA's
 * own accounts), and the newsletter signup. This replaces the previous
 * /discover (new-member carousel, cuisine browse, quick access grid,
 * combined news/events, map) rather than running alongside it, since none
 * of those appear on the reference page being matched.
 *
 * The reference's third card is "Foodie Bites", a lifestyle content feed
 * JRA's closest equivalent to is `/news` (JRA has no blog-style section;
 * `/magazine` is PDF issues, a worse fit) -- so Restaurants / Events /
 * News is what fills that row here.
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
  const associationName = tCommon("associationName");

  const [topRestaurants, upcomingEvents, latestNews, facets] = await Promise.all([
    db.restaurant.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ sustainabilityScore: "desc" }, { createdAt: "desc" }],
      take: 9,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        governorate: true,
      },
    }),
    db.event.findMany({
      where: { status: "PUBLISHED", startAt: { gte: new Date() } },
      orderBy: { startAt: "asc" },
      take: 3,
      include: { translations: { where: { locale: locale === "ar" ? "ar" : "en" } } },
    }),
    db.newsArticle.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: { translations: { where: { locale: locale === "ar" ? "ar" : "en" } } },
    }),
    getDirectoryFacets(),
  ]);

  const featuredRestaurant = topRestaurants[0];
  const galleryRestaurants = topRestaurants.slice(1, 9);

  return (
    <div>
      <DiscoverHero governorates={facets.governorates} />

      {/* Welcome blurb -- the reference's own text here ("Dine NS has been
          supporting restaurants and food lovers since 1947...") is close
          enough in shape to JRA's existing hero subtitle that this reuses
          it rather than writing new copy. */}
      <section className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 md:py-20">
        <p className="ui-caps text-sm font-semibold text-accent">{t("discoverWelcomeKicker")}</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
          {associationName}
        </h2>
        <p className="mx-auto mt-5 max-w-xl leading-relaxed text-ink-soft">{t("heroSubtitle")}</p>
      </section>

      {/* Three circular links into the site, matching the reference's own
          Restaurants / Events / Foodie Bites row -- JRA's nearest
          equivalent to the last one is News (see the file-level note). */}
      <section className="border-y border-rule bg-surface-2">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-6 px-4 py-14 sm:gap-10 sm:px-6">
          {[
            {
              key: "restaurants",
              href: "/restaurants",
              label: tNav("restaurants"),
              image: featuredRestaurant?.images[0]?.url ?? null,
              seed: featuredRestaurant?.slug ?? "restaurants",
            },
            {
              key: "events",
              href: "/events",
              label: tEvents("title"),
              image: upcomingEvents[0]?.coverImageUrl ?? null,
              seed: upcomingEvents[0]?.slug ?? "events",
            },
            {
              key: "news",
              href: "/news",
              label: tNav("news"),
              image: latestNews?.coverImageUrl ?? null,
              seed: latestNews?.slug ?? "news",
            },
          ].map((card) => (
            <Link key={card.key} href={card.href} className="group flex flex-col items-center text-center">
              <div className="w-full overflow-hidden rounded-full ring-1 ring-rule transition-shadow group-hover:ring-accent">
                <CoverThumb
                  url={card.image}
                  alt=""
                  seed={card.seed}
                  title={card.label}
                  sizes="(min-width: 640px) 160px, 30vw"
                  aspect="aspect-square"
                />
              </div>
              <span className="mt-3 text-sm font-semibold text-ink group-hover:text-accent sm:text-base">
                {card.label}
              </span>
            </Link>
          ))}
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
                    url={r.images[0]?.url ?? null}
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
