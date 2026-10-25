import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Users2,
  ClipboardCheck,
  GraduationCap,
  Handshake,
  BookOpen,
  Scale,
  CalendarDays,
  Store,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CoverThumb } from "@/components/cover-thumb";
import { ReachUs } from "@/components/home/reach-us";
import { NewsletterForm } from "@/components/newsletter-form";
import { StatGrid } from "@/components/stat-grid";
import { db } from "@/lib/db";
import { ORG } from "@/lib/organisation";
import { pageMetadata } from "@/lib/page-metadata";

// Cached and revalidated every 300s. Set per route since the site-wide
// force-dynamic was removed from the locale layout (blueprint §4.2).
export const revalidate = 300;

export const generateMetadata = pageMetadata("/for-members", "forMembers");

/**
 * The business side of the audience gate (`[locale]/page.tsx`): restaurant
 * and hospitality operators dealing with the association, rather than the
 * public looking for somewhere to eat (that's `/discover`). New page, not a
 * move of existing content — the old homepage never had a dedicated
 * business-facing landing, just the six mixed-audience Quick Access cards.
 *
 * Quick Access here is six cards same as before, but all six are now
 * actually for this audience (Member Portal, Classification, Training,
 * Membership, Knowledge Center, Legal) rather than two of six being
 * restaurant-directory links that belonged on the other side of the gate.
 * Knowledge Center and Legal get real content to point at now — see the
 * document-migration work that seeded /legal and /knowledge.
 */
export default async function ForMembersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");
  const tNav = await getTranslations("nav");
  const tNav2 = await getTranslations("nav2");
  const tHeader = await getTranslations("header");

  const [restaurantCount, supplierCount, representedGovernorates, latestNews, upcomingEvents] =
    await Promise.all([
      db.restaurant.count({ where: { status: "PUBLISHED" } }),
      db.supplier.count({ where: { status: "PUBLISHED" } }),
      db.restaurant.findMany({
        where: { status: "PUBLISHED", governorateId: { not: null } },
        distinct: ["governorateId"],
        select: { governorateId: true },
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

  const totalMembers = restaurantCount + supplierCount;
  const governorateCount = representedGovernorates.length;

  const quickAccess = [
    {
      key: "memberPortal",
      icon: Users2,
      label: tHeader("memberPortal"),
      href: ORG.external.crmLogin,
      external: true,
    },
    {
      key: "selfAssessment",
      icon: ClipboardCheck,
      label: tNav2("classification.selfAssessment"),
      href: "/classification#choose-type",
      external: false,
    },
    {
      key: "training",
      icon: GraduationCap,
      label: tNav("training"),
      href: "/training",
      external: false,
    },
    {
      key: "membership",
      icon: Handshake,
      label: tNav("membership"),
      href: "/membership",
      external: false,
    },
    {
      key: "knowledge",
      icon: BookOpen,
      label: tNav("knowledge"),
      href: "/knowledge",
      external: false,
    },
    {
      key: "legal",
      icon: Scale,
      label: tNav("legal"),
      href: "/legal",
      external: false,
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
      {/* Intro band — this side of the gate has no photo carousel of its
          own (there's no equivalent "newest member business" feed), so a
          plain dark band carries the opening beat instead, same canvas-deep
          tone the gate and the discover side both open with. */}
      <section className="bg-canvas-deep">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 md:px-8 md:py-24">
          <h1 className="font-editorial text-[clamp(1.8rem,4vw,2.75rem)] font-semibold text-white rtl:font-display">
            {t("forMembersTitle")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/75">{t("forMembersSubtitle")}</p>
          <Link
            href="/gate?to=diner"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white"
          >
            {t("gateSwitchToDiner")}
            <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:px-8">
        <h2 className="font-display font-semibold text-3xl text-ink">
          {t("forMembersQuickAccessTitle")}
        </h2>
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

      <section className="border-y border-rule">
        <StatGrid
          className="mx-auto max-w-7xl grid-cols-2 divide-x divide-rule px-4 py-12 sm:grid-cols-4 sm:px-6 md:px-8 rtl:divide-x-reverse"
          stats={[
            { value: totalMembers, label: t("statMembers"), suffix: "+" },
            { value: restaurantCount, label: t("statRestaurants") },
            { value: governorateCount, label: t("statGovernorates") },
            { value: ORG.foundingYear, label: t("statFounded"), animate: false },
          ]}
        />
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
