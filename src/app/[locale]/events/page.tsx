import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarDays, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CoverThumb } from "@/components/cover-thumb";
import { db } from "@/lib/db";
import { pageMetadata } from "@/lib/page-metadata";
import { ui } from "@/lib/ui";

// Cached and revalidated every 900s, matching /news — events change on a
// similar cadence and this page is built the same way deliberately.
export const revalidate = 900;

export const generateMetadata = pageMetadata("/events", "events");

/**
 * The `Event` and `MediaGalleryItem` models have existed in the schema since
 * before this page did, related and ready, with nothing in the app reading
 * from them. This is the first public page built against real event data
 * rather than a placeholder — there is no admin UI to create one yet, so an
 * empty list here is the honest current state, not a bug.
 */
export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav2.newsEvents");
  const te = await getTranslations("events");
  const tCommon = await getTranslations("common");

  const now = new Date();
  const events = await db.event.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { startAt: "desc" },
    include: { translations: { where: { locale: locale === "ar" ? "ar" : "en" } } },
  });

  const upcoming = events.filter((e) => e.startAt >= now).reverse();
  const past = events.filter((e) => e.startAt < now);

  const dateRange = (start: Date, end: Date | null) => {
    const fmt: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
    const startStr = start.toLocaleDateString(locale, fmt);
    if (!end || end.toDateString() === start.toDateString()) return startStr;
    return `${startStr} – ${end.toLocaleDateString(locale, fmt)}`;
  };

  const EventCard = ({ e, muted = false }: { e: (typeof events)[number]; muted?: boolean }) => {
    const title = e.translations[0]?.title ?? e.slug;
    return (
      <div
        className={`motion-card flex flex-col overflow-hidden rounded-2xl border border-rule bg-surface ${muted ? "opacity-70" : ""}`}
      >
        <CoverThumb
          url={e.coverImageUrl}
          alt=""
          seed={e.slug}
          title={title}
          sizes="(min-width: 640px) 50vw, 100vw"
        />
        <div className="flex flex-1 flex-col p-6 sm:p-8">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-faint">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            {dateRange(e.startAt, e.endAt)}
          </span>
          <h2 className="mt-2 font-display font-semibold text-xl text-ink">{title}</h2>
          {e.locationText ? (
            <span className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink-soft">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {e.locationText}
            </span>
          ) : null}
          {e.registrationUrl ? (
            <a
              href={e.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-fit items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              {tCommon("learnMore")}
            </a>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className={ui.pageTitle}>{t("events")}</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">{te("description")}</p>

      <section className="mt-10">
        <h2 className="ui-caps font-semibold text-ink-soft">{te("upcoming")}</h2>
        {upcoming.length === 0 ? (
          <p className="mt-4 text-sm text-ink-faint">{te("noUpcoming")}</p>
        ) : (
          <div className="stagger mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {upcoming.map((e) => (
              <EventCard key={e.id} e={e} />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 ? (
        <section className="mt-16 border-t border-rule pt-10">
          <h2 className="ui-caps font-semibold text-ink-soft">{te("past")}</h2>
          <div className="stagger mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {past.map((e) => (
              <EventCard key={e.id} e={e} muted />
            ))}
          </div>
        </section>
      ) : null}

      <Link href="/news" className="mt-12 inline-block text-sm font-medium text-accent hover:underline">
        {tCommon("viewAll")} →
      </Link>
    </div>
  );
}
