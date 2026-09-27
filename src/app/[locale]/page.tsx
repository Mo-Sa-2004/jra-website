import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Store,
  ClipboardCheck,
  Leaf,
  Handshake,
  ArrowRight,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { RestaurantCard } from "@/components/restaurant-card";
import { NewsletterForm } from "@/components/newsletter-form";
import { HomeHero } from "@/components/home/hero";
import { PartnerStrip } from "@/components/home/partner-strip";
import { ReachUs } from "@/components/home/reach-us";
import { getFeaturedRestaurants } from "@/lib/restaurants";
import { db } from "@/lib/db";
import { StatGrid } from "@/components/stat-grid";
import { ORG } from "@/lib/organisation";

// Cached and revalidated every 300s. Set per route since the site-wide
// force-dynamic was removed from the locale layout (blueprint §4.2).
export const revalidate = 300;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");

  const [
    featured,
    restaurantCount,
    supplierCount,
    representedGovernorates,
    latestNews,
    heroImageRows,
    cuisineRows,
  ] = await Promise.all([
    getFeaturedRestaurants(6),
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
      take: 3,
      select: {
        id: true,
        slug: true,
        publishedAt: true,
        coverImageUrl: true,
        translations: {
          where: { locale: locale === "ar" ? "ar" : "en" },
          select: { title: true, excerpt: true },
        },
      },
    }),
    // Hero corridor: real member photography rather than stock. One image per
    // restaurant so the same venue never appears twice on a rail. Fourteen
    // covers the seven cards per rail without the sequence visibly repeating.
    db.restaurantImage.findMany({
      where: { isPrimary: true, restaurant: { status: "PUBLISHED" } },
      select: { url: true, altTextEn: true, altTextAr: true, restaurant: { select: { name: true } } },
      distinct: ["restaurantId"],
      take: 14,
      orderBy: { restaurantId: "asc" },
    }),
    db.cuisine.findMany({
      select: {
        slug: true,
        nameEn: true,
        nameAr: true,
        _count: { select: { restaurants: true } },
      },
    }),
  ]);

  const totalMembers = restaurantCount + supplierCount;
  const governorateCount = representedGovernorates.length;

  const heroImages = heroImageRows.map((img) => ({
    url: img.url,
    alt: (locale === "ar" ? img.altTextAr : img.altTextEn) ?? img.restaurant?.name ?? "",
  }));

  // Top cuisines by member count. Empty ones are dropped rather than shown as
  // zeroes — the strip is meant to read as range, not as a gap report.
  const heroCuisines = cuisineRows
    .filter((c) => c._count.restaurants > 0)
    .sort((a, b) => b._count.restaurants - a._count.restaurants)
    .slice(0, 8)
    .map((c) => ({
      slug: c.slug,
      label: (locale === "ar" && c.nameAr ? c.nameAr : c.nameEn) ?? c.slug,
      count: c._count.restaurants,
    }));

  const services = [
    {
      icon: Store,
      title: t("serviceDirectory"),
      desc: t("serviceDirectoryDesc"),
      href: "/restaurants",
    },
    {
      icon: ClipboardCheck,
      title: t("serviceClassification"),
      desc: t("serviceClassificationDesc"),
      href: "/classification",
    },
    {
      icon: Handshake,
      title: t("serviceMembership"),
      desc: t("serviceMembershipDesc"),
      href: "/membership",
    },
    {
      icon: Leaf,
      title: t("serviceSustainability"),
      desc: t("serviceSustainabilityDesc"),
      href: "/sustainability",
    },
  ];

  return (
    /* The descent runs the whole page. It is deliberately two gradients, not
       one: the murky middle of a navy-to-parchment ramp is where text becomes
       unreadable, so that part is compressed into the inner container below,
       where the styling is under control. Everything out here stays light —
       raised surface drifting to parchment across the remaining sections —
       which is a change you feel while scrolling rather than one you can
       point at. */
    <div className="bg-gradient-to-b from-surface-2 to-paper">
      {/* The navy-to-paper fade spans exactly this container: the hero and
          the services grid. Anchoring it to a real element rather than
          guessing viewport heights is what keeps it predictable — the fade
          finishes at a known edge, so nothing further down can drift onto a
          mid-tone where neither dark nor light text is readable. Everything
          inside is styled for a dark ground; everything after is on paper. */}
      <div className="bg-[linear-gradient(180deg,var(--color-canvas-deep)_0%,var(--color-canvas-deep)_58%,var(--color-canvas-deep-2)_78%,var(--color-surface-2)_100%)]">
      <HomeHero
        images={heroImages}
        cuisines={heroCuisines}
        restaurantCount={restaurantCount}
        totalMembers={totalMembers}
      />

      {/* Sector services — inside the dark half of the fade, so the heading
          is light and the cards keep their own solid surface rather than
          going translucent, which would drag their text onto the navy. */}
      <section className="mx-auto max-w-7xl px-4 pb-28 pt-16 sm:px-6 md:px-8 sm:pb-36">
        <h2 className="font-display font-semibold text-4xl text-white">
          {t("servicesTitle")}
        </h2>
        <div className="stagger mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="motion-card group rounded-2xl border border-rule bg-surface p-6 sm:p-8"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
                <s.icon className="h-6 w-6 text-accent" strokeWidth={1.75} />
              </span>
              <h3 className="mt-4 font-display font-semibold text-2xl text-ink">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
                {tCommon("learnMore")}
                <ArrowRight className="cta-arrow h-3.5 w-3.5 rtl:rotate-180" />
              </span>
            </Link>
          ))}
        </div>
      </section>
      </div>

      {/* Stats */}
      <section className="border-y border-rule">
        <StatGrid
          // divide-x rather than a border per card: four numbers reading as
          // one strip of figures, not four boxes competing for attention.
          className="mx-auto max-w-7xl grid-cols-2 divide-x divide-rule px-4 py-12 sm:grid-cols-4 sm:px-6 md:px-8 rtl:divide-x-reverse"
          stats={[
            { value: totalMembers, label: t("statMembers"), suffix: "+" },
            { value: restaurantCount, label: t("statRestaurants") },
            { value: governorateCount, label: t("statGovernorates") },
            { value: ORG.foundingYear, label: t("statFounded"), animate: false },
          ]}
        />
      </section>

      {/* Featured restaurants */}
      {featured.length > 0 && (
        // The section gets its own panel — a visibly distinct "shelf" for the
        // cards, using the same border/surface pair as every other card on
        // the site rather than a drop shadow (flat design system; see the
        // About page and restaurant-card.tsx for the same note). And 3
        // columns rather than 4: 6 featured restaurants divide evenly into
        // two full rows of 3, where 4 columns left the second row two cards
        // short — the abrupt gap on the right on wide screens.
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:px-8 md:py-24">
          <div className="rounded-3xl border border-rule bg-surface-2 p-6 sm:p-8 md:p-10">
            <div className="flex items-end justify-between">
              <h2 className="font-display font-semibold text-4xl text-ink">
                {t("serviceDirectory")}
              </h2>
              <Link href="/restaurants" className="text-sm font-medium text-accent">
                {tCommon("viewAll")} →
              </Link>
            </div>
            <div className="stagger mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((r) => (
                <div key={r.slug}>
                  <RestaurantCard restaurant={r} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* News */}
      {latestNews.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:px-8 md:py-24">
          <div className="flex items-end justify-between">
            <h2 className="font-display font-semibold text-4xl text-ink">
              {t("newsTitle")}
            </h2>
            <Link href="/news" className="text-sm font-medium text-accent">
              {tCommon("viewAll")} →
            </Link>
          </div>
          <div className="stagger mt-8 grid gap-6 sm:grid-cols-3">
            {latestNews.map((n) => (
              <Link
                key={n.id}
                href={`/news/${n.slug}`}
                className="motion-card group block overflow-hidden rounded-2xl border border-rule bg-surface"
              >
                {n.coverImageUrl ? (
                  <div className="relative aspect-[16/9] overflow-hidden bg-surface-2">
                    <Image
                      src={n.coverImageUrl}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 33vw, 100vw"
                      className="motion-card-image object-cover"
                    />
                  </div>
                ) : null}
                <div className="p-6 sm:p-8">
                  {n.publishedAt ? (
                    <time className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                      {new Date(n.publishedAt).toLocaleDateString(locale)}
                    </time>
                  ) : null}
                  <h3 className="mt-2 font-display font-semibold text-2xl leading-snug text-ink transition-colors group-hover:text-accent">
                    {n.translations[0]?.title ?? "—"}
                  </h3>
                  {n.translations[0]?.excerpt ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                      {n.translations[0].excerpt}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* The three destinations JRA sends people to that are not on this
          site, and where the association physically is. Both sit after the
          site's own content and before the newsletter ask. */}
      <PartnerStrip />

      <ReachUs />

      {/* Newsletter */}
      <section className="border-t border-rule text-ink">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 md:px-8 md:py-24">
          <h2 className="font-display font-semibold text-4xl">{t("newsletterTitle")}</h2>
          <p className="mt-2 text-ink-soft">{t("newsletterSubtitle")}</p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
