import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FileText, Download, Mail, PlayCircle } from "lucide-react";
import { db } from "@/lib/db";
import { pageMetadata } from "@/lib/page-metadata";
import { AboutCarousel } from "@/components/about/about-carousel";
import { StatGrid } from "@/components/stat-grid";
import { ORG } from "@/lib/organisation";
import { toVideoEmbed } from "@/lib/video-embed";
import { clampSlideSeconds } from "@/lib/about-timing";
import { cx, ui } from "@/lib/ui";

// Cached and revalidated every 3600s. Set per route since the site-wide
// force-dynamic was removed from the locale layout (blueprint §4.2).
export const revalidate = 3600;

export const generateMetadata = pageMetadata("/about", "about");

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const ar = locale === "ar";
  const t = await getTranslations("nav");
  const tAbout = await getTranslations("about");

  const [board, staff, reports, slides, settings, restaurantCount, governorates] =
    await Promise.all([
      db.person.findMany({ where: { kind: "BOARD_MEMBER" }, orderBy: { sortOrder: "asc" } }),
      db.person.findMany({ where: { kind: "STAFF" }, orderBy: { sortOrder: "asc" } }),
      db.resource.findMany({
        where: { type: "ANNUAL_REPORT", status: "PUBLISHED" },
        include: { translations: { where: { locale: ar ? "ar" : "en" } } },
        orderBy: { createdAt: "desc" },
      }),
      // Every slide added is shown. There is no hidden state any more —
      // removing one from the carousel means deleting it.
      db.aboutSlide.findMany({ orderBy: { sortOrder: "asc" } }),
      db.siteSetting.findUnique({
        where: { id: "singleton" },
        select: { aboutVideoUrl: true, aboutSlideSeconds: true },
      }),
      db.restaurant.count({ where: { status: "PUBLISHED" } }),
      db.restaurant.findMany({
        where: { status: "PUBLISHED", governorateId: { not: null } },
        distinct: ["governorateId"],
        select: { governorateId: true },
      }),
    ]);

  const video = toVideoEmbed(settings?.aboutVideoUrl);

  /**
   * Position in the reader's language. This page showed `positionEn` to
   * everyone, so an Arabic reader got Arabic names above English job titles.
   */
  const position = (p: { positionEn: string | null; positionAr: string | null }) =>
    (ar && p.positionAr) || p.positionEn;

  const stats = [
    { value: new Date().getFullYear() - ORG.foundingYear, label: tAbout("statYears") },
    { value: restaurantCount, label: tAbout("statClassified") },
    { value: governorates.length, label: tAbout("statGovernorates") },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      {/* Intro copy sits beside the carousel rather than above it — a
          full-width paragraph with a wide banner orphaned underneath it read
          as two unrelated blocks instead of one hero. Falls back to a single
          centred column when there are no slides to pair it with. */}
      <div
        className={cx(
          "grid grid-cols-1 gap-10 md:gap-14",
          // items-stretch is the grid default, spelled out here because the
          // carousel column relies on it: see about-carousel.tsx.
          slides.length > 0 && "md:grid-cols-2 md:items-stretch"
        )}
      >
        <header
          className={cx("flex flex-col justify-center", slides.length === 0 && "max-w-3xl")}
        >
          <p className="ui-caps font-semibold text-accent">{tAbout("kicker")}</p>
          <h1 className={cx("mt-2", ui.pageTitle)}>{t("about")}</h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">{tAbout("intro")}</p>
        </header>

        {slides.length > 0 ? (
          <AboutCarousel
            slides={slides.map((s) => ({
              id: s.id,
              imageUrl: s.imageUrl,
              caption: (ar && s.captionAr) || s.captionEn || null,
            }))}
            intervalMs={clampSlideSeconds(settings?.aboutSlideSeconds) * 1000}
          />
        ) : null}
      </div>

      {/* Real numbers, computed rather than typed. The old jra.jo shipped four
          counters all reading zero. Each gets its own card here rather than
          the plain rule-separated band the homepage uses — on this page the
          figures are their own section, not a strip crossing the full page. */}
      <StatGrid
        variant="card"
        className="mt-20 grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6"
        stats={stats}
      />

      {video ? (
        <section className="mt-20">
          <h2 className="flex items-center gap-2 font-display font-semibold text-2xl text-ink">
            <PlayCircle className="h-5 w-5 text-accent" aria-hidden="true" />
            {tAbout("videoTitle")}
          </h2>
          {/* A real 16:9 box with a width cap, rather than reusing the
              carousel's wide aspect ratio — that stretched the player far
              past a sensible video width, with black bars down both sides. */}
          <div className="mx-auto mt-5 aspect-video max-w-4xl overflow-hidden rounded-2xl border border-rule bg-surface-2">
            {/* Lazy: the page should not fetch a player nobody scrolled to. */}
            <iframe
              src={video.src}
              title={tAbout("videoTitle")}
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="h-full w-full border-0"
            />
          </div>
        </section>
      ) : null}

      {board.length > 0 && (
        <section className="mt-20 border-t border-rule pt-16">
          <h2 className="font-display font-semibold text-2xl text-ink">{t("aboutBoard")}</h2>
          <div className="stagger mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-6">
            {board.map((p) => (
              <div key={p.id} className="group text-center">
                <div className="zoom-frame relative mx-auto h-24 w-24 overflow-hidden rounded-full border border-rule bg-surface-2">
                  {p.photoUrl ? (
                    <Image
                      src={p.photoUrl}
                      alt=""
                      fill
                      sizes="96px"
                      className="motion-card-image object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center font-display text-2xl text-ink/25">
                      {p.name.trim().charAt(0)}
                    </span>
                  )}
                </div>
                <div className="mt-3 text-sm font-semibold text-ink">{p.name}</div>
                {position(p) ? (
                  <div className="text-xs leading-snug text-ink-faint">{position(p)}</div>
                ) : null}
                {p.termLabel ? (
                  <div className="mt-1 text-[11px] text-ink-faint">{p.termLabel}</div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {staff.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display font-semibold text-2xl text-ink">{t("aboutTeam")}</h2>
          <div className="stagger mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {staff.map((p) => (
              <div
                key={p.id}
                className="motion-card group rounded-2xl border border-rule bg-surface p-6 text-center"
              >
                <div className="zoom-frame relative mx-auto h-20 w-20 overflow-hidden rounded-full border border-rule bg-surface-2">
                  {p.photoUrl ? (
                    <Image
                      src={p.photoUrl}
                      alt=""
                      fill
                      sizes="80px"
                      className="motion-card-image object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center font-display text-xl text-ink/25">
                      {p.name.trim().charAt(0)}
                    </span>
                  )}
                </div>
                <div className="mt-4 text-sm font-semibold text-ink">{p.name}</div>
                {position(p) ? (
                  <div className="mt-0.5 text-xs leading-snug text-ink-faint">{position(p)}</div>
                ) : null}
                {p.email ? (
                  <a
                    href={`mailto:${p.email}`}
                    dir="ltr"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs text-accent transition-colors hover:text-accent-strong"
                  >
                    <Mail className="h-3 w-3" aria-hidden="true" />
                    {p.email}
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {reports.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display font-semibold text-2xl text-ink">{t("aboutReports")}</h2>
          <div className="stagger mt-8 grid gap-4 sm:grid-cols-2">
            {reports.map((r) => (
              <a
                key={r.id}
                href={r.fileUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="motion-card group flex items-center gap-4 rounded-2xl border border-rule bg-surface p-6"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium text-ink">
                  {r.translations[0]?.title ?? r.slug}
                </span>
                <Download
                  className="h-4 w-4 shrink-0 text-ink-faint transition-colors group-hover:text-accent"
                  aria-hidden="true"
                />
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
