import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Store,
  Users2,
  Truck,
  GraduationCap,
  ClipboardCheck,
  Briefcase,
  CalendarDays,
  ExternalLink,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CoverThumb } from "@/components/cover-thumb";
import { NewMemberBanner, type BannerRestaurant } from "@/components/home/new-member-banner";
import { ReachUs } from "@/components/home/reach-us";
import { NewsletterForm } from "@/components/newsletter-form";
import { db } from "@/lib/db";
import { ORG } from "@/lib/organisation";

// Cached and revalidated every 300s. Set per route since the site-wide
// force-dynamic was removed from the locale layout (blueprint §4.2).
export const revalidate = 300;

/**
 * Rebuilt to the client's "FINAL SITEMAP & HOME PAGE WIREFRAME" handover
 * (October 2026): Header, the dynamic new-member banner, six Quick Access
 * cards, one combined News & Events section, Reach Us (map and contact
 * details) and a newsletter signup, then the Footer. The wireframe's five
 * sections stop at News & Events; Reach Us and the newsletter form were
 * added back afterward at the client's own request for a fuller, more
 * professional-feeling homepage — both already existed in the codebase
 * (built for the previous homepage) and needed no rework beyond the usual
 * token colors to fit back in. The previous homepage's marketing hero,
 * services band, stats band, featured-restaurants grid and partner strip
 * are still not here — the doc is explicit the page should not carry a
 * second restaurant grid or a standalone training section below the fold,
 * and partner strip's links mostly duplicate the Quick Access grid above.
 * Those three (PartnerStrip, HomeHero, and the old stats/services bands)
 * are left in the codebase rather than deleted, in case they belong
 * elsewhere later.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");
  const tNav2 = await getTranslations("nav2");
  const tHeader = await getTranslations("header");

  const sevenDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);

  const [newMembers, latestNews, upcomingEvents] = await Promise.all([
    // "02 Dynamic New-Member Restaurants Banner": the newest approved
    // restaurants, newest first — real membership data, not stock photography.
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
  ]);

  const bannerRestaurants: BannerRestaurant[] = newMembers.map((r) => ({
    slug: r.slug,
    name: (locale === "ar" && r.nameAr) || r.name,
    imageUrl: r.images[0]?.url ?? null,
    location: (locale === "ar" ? r.governorate?.nameAr : r.governorate?.nameEn) ?? null,
    isNew: r.createdAt >= sevenDaysAgo,
  }));

  // "03 Quick Access – 6 services", in the exact order the handover
  // specifies. Member Portal and SiyahaJobs are the two that hand off to
  // another system rather than a page on this site.
  const quickAccess = [
    {
      key: "memberPortal",
      icon: Users2,
      label: tHeader("memberPortal"),
      href: ORG.external.crmLogin,
      external: true,
    },
    {
      key: "siyahaJobs",
      icon: Briefcase,
      label: t("siyahaJobs"),
      href: "/jobs",
      external: false,
    },
    {
      key: "restaurants",
      icon: Store,
      label: tNav2("directory.restaurants"),
      href: "/restaurants",
      external: false,
    },
    {
      key: "suppliers",
      icon: Truck,
      label: tNav2("directory.suppliers"),
      href: "/suppliers",
      external: false,
    },
    {
      key: "training",
      icon: GraduationCap,
      label: tNav2("training.upcoming"),
      href: "/training",
      external: false,
    },
    {
      key: "selfAssessment",
      icon: ClipboardCheck,
      label: tNav2("classification.selfAssessment"),
      href: "/classification#choose-type",
      external: false,
    },
  ] as const;

  // "04 Latest News & Events": one merged, date-sorted feed rather than two
  // separate sections — the doc is explicit that a standalone training block
  // or a second restaurant section do not belong here, and by the same logic
  // news and events share a single list rather than sitting side by side.
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

      {/* Quick Access — exactly 6 cards, one row on desktop, 3x2 on tablet,
          2x3 on mobile. The handover doc asks explicitly for no slider here. */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:px-8">
        <h2 className="font-display font-semibold text-3xl text-ink">{t("quickAccessTitle")}</h2>
        <div className="stagger mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {quickAccess.map((item) => {
            const content = (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="mt-3 text-center text-sm font-semibold leading-snug text-ink">
                  {item.label}
                </span>
                {item.external ? (
                  <ExternalLink className="mt-1 h-3 w-3 text-ink-faint" aria-hidden="true" />
                ) : null}
              </>
            );
            const className =
              "motion-card flex flex-col items-center rounded-2xl border border-rule bg-surface p-5 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
            return item.external ? (
              <a key={item.key} href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
                {content}
              </a>
            ) : (
              <Link key={item.key} href={item.href} className={className}>
                {content}
              </Link>
            );
          })}
        </div>
      </section>

      {/* News & Events — one combined section: a featured item, then a
          concise list of the next latest, then View All. */}
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

      {/* Newsletter — the one dark band on an otherwise light page, same
          register the old marketing hero used to open the homepage with
          before the rebuild. NewsletterForm itself is styled for a dark
          surface (paper-tinted text and borders), so it keeps that wrapper
          rather than being restyled for the light sections around it. */}
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
