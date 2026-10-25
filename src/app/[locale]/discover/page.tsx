import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Store,
  Briefcase,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CoverThumb } from "@/components/cover-thumb";
import { NewMemberBanner, type BannerRestaurant } from "@/components/home/new-member-banner";
import { SearchCuisineBand } from "@/components/home/search-cuisine-band";
import { ReachUs } from "@/components/home/reach-us";
import { NewsletterForm } from "@/components/newsletter-form";
import { db } from "@/lib/db";
import { pageMetadata } from "@/lib/page-metadata";

// Cached and revalidated every 300s. Set per route since the site-wide
// force-dynamic was removed from the locale layout (blueprint §4.2).
export const revalidate = 300;

export const generateMetadata = pageMetadata("/discover", "discover");

/**
 * The public/diner side of the audience gate (`[locale]/page.tsx`). This is
 * what used to BE the homepage before the gate split it in two — the New
 * Member Banner carousel, search + cuisine browse, a Quick Access grid
 * trimmed down to what a diner actually wants (restaurants, news, jobs —
 * not classification or member-portal links, which moved to
 * `/for-members`), stats, news & events, the map, and the newsletter form.
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
  const tNav2 = await getTranslations("nav2");

  const sevenDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);

  const [newMembers, latestNews, upcomingEvents, restaurantCount, cuisineRows] =
    await Promise.all([
      db.restaurant.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          governorate: true,
        },
      }),
      db.newsArticle.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 4,
        include: { translations: { where: { locale: locale === "ar" ? "ar" : "en" } } },
      }),
      db.event.findMany({
        where: { status: "PUBLISHED", startAt: { gte: new Date() } },
        orderBy: { startAt: "asc" },
        take: 4,
        include: { translations: { where: { locale: locale === "ar" ? "ar" : "en" } } },
      }),
      db.restaurant.count({ where: { status: "PUBLISHED" } }),
      db.cuisine.findMany({
        select: {
          slug: true,
          nameEn: true,
          nameAr: true,
          _count: { select: { restaurants: true } },
        },
      }),
    ]);

  // Top cuisines by member count. Empty ones are dropped rather than shown
  // as zeroes — the strip is meant to read as range, not as a gap report.
  const browseCuisines = cuisineRows
    .filter((c) => c._count.restaurants > 0)
    .sort((a, b) => b._count.restaurants - a._count.restaurants)
    .slice(0, 8)
    .map((c) => ({
      slug: c.slug,
      label: (locale === "ar" && c.nameAr ? c.nameAr : c.nameEn) ?? c.slug,
      count: c._count.restaurants,
    }));

  const bannerRestaurants: BannerRestaurant[] = newMembers.map((r) => ({
    slug: r.slug,
    name: (locale === "ar" && r.nameAr) || r.name,
    imageUrl: r.images[0]?.url ?? null,
    location: (locale === "ar" ? r.governorate?.nameAr : r.governorate?.nameEn) ?? null,
    isNew: r.createdAt >= sevenDaysAgo,
  }));

  // Diner-relevant Quick Access only — Member Portal, Classification and
  // Training moved to /for-members, since none of those are what someone
  // choosing "Find a Restaurant" came here for.
  const quickAccess = [
    {
      key: "restaurants",
      icon: Store,
      label: tNav2("directory.restaurants"),
      href: "/restaurants",
    },
    {
      key: "siyahaJobs",
      icon: Briefcase,
      label: t("siyahaJobs"),
      href: "/jobs",
    },
  ] as const;

  type Combined =
    | { kind: "news"; date: Date; id: string; title: string; href: string; cover: string | null; excerpt: string | null }
    | { kind: "event"; date: Date; id: string; title: string; href: string; cover: string | null; location: string | null };

  const combined: Combined[] = [
    ...latestNews
      .filter((n) => n.publishedAt)
      .map((n): Combined => ({
        kind: "news",
        date: n.publishedAt as Date,
        id: n.id,
        title: n.translations[0]?.title ?? n.slug,
        href: `/news/${n.slug}`,
        cover: n.coverImageUrl,
        excerpt: n.translations[0]?.excerpt ?? null,
      })),
    ...upcomingEvents.map((e): Combined => ({
      kind: "event",
      date: e.startAt,
      id: e.id,
      title: e.translations[0]?.title ?? e.slug,
      href: "/events",
      cover: e.coverImageUrl,
      location: e.locationText,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const [featured, ...rest] = combined;

  return (
    <div>
      <NewMemberBanner restaurants={bannerRestaurants} />

      <SearchCuisineBand cuisines={browseCuisines} restaurantCount={restaurantCount} />

      {/* Switch sides — small and out of the way, for the rare visitor who
          picked the wrong tile on the gate. */}
      <div className="border-b border-rule bg-surface-2">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 md:px-8">
          <Link
            href="/gate?to=member"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent"
          >
            {t("gateSwitchToMember")}
            <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:px-8">
        <h2 className="font-display font-semibold text-3xl text-ink">{t("quickAccessTitle")}</h2>
        <div className="stagger mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {quickAccess.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="motion-card flex flex-col items-center rounded-2xl border border-rule bg-surface p-5 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="mt-3 text-center text-sm font-semibold leading-snug text-ink">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {featured ? (
        <section className="border-t border-rule bg-surface-2">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:px-8">
            <div className="flex items-end justify-between">
              <h2 className="font-display font-semibold text-3xl text-ink">
                {t("newsEventsTitle")}
              </h2>
              <Link href="/news" className="text-sm font-medium text-accent">
                {tCommon("viewAll")} →
              </Link>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
              <Link
                href={featured.href}
                className="motion-card group flex flex-col overflow-hidden rounded-2xl border border-rule bg-surface sm:flex-row"
              >
                <div className="sm:w-1/2">
                  <CoverThumb
                    url={featured.cover}
                    alt=""
                    seed={featured.id}
                    title={featured.title}
                    sizes="(min-width: 640px) 50vw, 100vw"
                    aspect="aspect-[16/10]"
                    priority
                  />
                </div>
                <div className="flex flex-1 flex-col justify-center p-6 sm:p-8">
                  <span className="ui-caps inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-accent">
                    {featured.kind === "event" ? <CalendarDays className="h-3 w-3" aria-hidden="true" /> : null}
                    {t("featured")}
                  </span>
                  <h3 className="mt-2 font-display font-semibold text-2xl leading-snug text-ink">
                    {featured.title}
                  </h3>
                  {featured.kind === "news" && featured.excerpt ? (
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-soft">
                      {featured.excerpt}
                    </p>
                  ) : null}
                  {featured.kind === "event" && featured.location ? (
                    <p className="mt-3 text-sm text-ink-soft">{featured.location}</p>
                  ) : null}
                  <time className="mt-4 text-xs text-ink-faint">
                    {featured.date.toLocaleDateString(locale)}
                  </time>
                </div>
              </Link>

              <ul className="flex flex-col gap-3">
                {rest.slice(0, 3).map((item) => (
                  <li key={`${item.kind}-${item.id}`}>
                    <Link
                      href={item.href}
                      className="motion-card flex items-center gap-4 rounded-2xl border border-rule bg-surface p-4"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                        {item.kind === "event" ? (
                          <CalendarDays className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Store className="h-4 w-4" aria-hidden="true" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">
                          {item.title}
                        </span>
                        <time className="text-xs text-ink-faint">
                          {item.date.toLocaleDateString(locale)}
                        </time>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      <ReachUs />

      <section className="border-t border-rule bg-ink">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 md:px-8 md:py-24">
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
