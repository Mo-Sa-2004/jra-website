import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { HeroSearch } from "@/components/home/hero-search";

/**
 * Homepage hero.
 *
 * The previous version was a white card floating over a blurred backdrop, with
 * the association described in prose and two buttons beneath it. It told you
 * JRA represents Jordan's restaurants. This shows them: real member
 * photography beside the text, search as the primary action, and the cuisine
 * strip doing double duty as proof of range and as navigation.
 *
 * The right side was originally a moving 3D corridor of photos rushing toward
 * the viewer. It looked striking at full hero width but cramped once boxed
 * into a column next to the text — a motion effect built for filling a whole
 * screen doesn't shrink gracefully into a frame. This replaces it with a
 * static collage of the same real member photography: same promise, no
 * effect that needs a lot of room to read as intentional rather than
 * squeezed.
 *
 * Dark ground on purpose — food photography reads better against it, and it
 * gives the page a distinct opening register before settling into the light
 * editorial layout below.
 *
 * Governorates were the first candidate for the cuisine strip, but three of
 * them hold no restaurants and 288 listings have none assigned, so it would
 * have advertised the gap rather than the reach. Cuisine covers 78% and
 * spreads properly.
 */

export type HeroCuisine = { slug: string; label: string; count: number };

export async function HomeHero({
  images,
  cuisines,
  restaurantCount,
  totalMembers,
}: {
  images: { url: string; alt: string }[];
  cuisines: HeroCuisine[];
  restaurantCount: number;
  totalMembers: number;
}) {
  const t = await getTranslations("home");

  const [main, sideA, sideB] = images;

  return (
    <div className="bg-canvas-deep">
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-16 pt-24 sm:px-6 md:px-8 sm:pb-20 sm:pt-36 lg:grid-cols-12 lg:gap-8 lg:pt-32">
        <div className="lg:col-span-7">
          <p
            className="animate-editorial-rise text-xs font-semibold uppercase tracking-[0.2em] text-brass"
            style={{ animationDelay: "80ms" }}
          >
            {t("heroKicker")}
          </p>

          {/* Arabic sets the scale here: it needs the looser line-height, and
              tracking is left alone in RTL. The Latin side uses Fraunces —
              already loaded for the system and, until now, barely used. */}
          <h1
            className="animate-editorial-rise mt-5 font-editorial text-[clamp(2.4rem,5vw,4.5rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-white rtl:font-display rtl:leading-[1.35] rtl:tracking-normal"
            style={{ animationDelay: "160ms" }}
          >
            {t("heroTitle")}
          </h1>

          <p
            className="animate-editorial-rise mt-5 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg"
            style={{ animationDelay: "240ms" }}
          >
            {t("heroSubtitle")}
          </p>

          <div className="animate-editorial-rise mt-8 max-w-xl" style={{ animationDelay: "320ms" }}>
            <HeroSearch />
            <p className="mt-3 text-sm text-white/55">
              {t("heroSearchHint", { count: restaurantCount })}
            </p>
          </div>
        </div>

        {/* Real member photography as a static collage — one large frame and,
            when there are enough photos to fill them without repeating, two
            smaller ones underneath. Falls back gracefully with fewer images:
            just the large frame, or nothing at all rather than an empty box. */}
        {main ? (
          <div className="animate-editorial-rise lg:col-span-5" style={{ animationDelay: "200ms" }}>
            <div className="relative h-[260px] w-full overflow-hidden rounded-2xl border border-white/10">
              <Image
                src={main.url}
                alt={main.alt}
                fill
                sizes="(min-width: 1024px) 38vw, 90vw"
                className="object-cover"
                priority
              />
              {/* Floating badge — real figures (member count, classified
                  restaurants), not a generic star rating: there's no
                  crowd-review system behind this site to back one up, only
                  JRA's own classification, which the directory already shows
                  per restaurant. */}
              <div className="absolute bottom-3 start-3 flex items-center gap-2 rounded-xl border border-white/30 bg-white/85 px-3 py-2 backdrop-blur-md">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Users className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-xs leading-tight text-ink">
                  <span className="block font-display font-semibold text-sm">
                    {totalMembers}+ {t("statMembers")}
                  </span>
                  <span className="block text-ink-soft">
                    {restaurantCount} {t("statRestaurants")}
                  </span>
                </span>
              </div>
            </div>

            {sideA || sideB ? (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {[sideA, sideB].map((img, i) =>
                  img ? (
                    <div
                      key={img.url}
                      className="relative h-[140px] overflow-hidden rounded-2xl border border-white/10"
                    >
                      <Image
                        src={img.url}
                        alt={img.alt}
                        fill
                        sizes="(min-width: 1024px) 19vw, 45vw"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    // Odd photo count: an empty rounded frame reads as an
                    // intentional gap in an editorial grid, not a broken tile.
                    <div key={`empty-${i}`} className="rounded-2xl border border-white/10" />
                  ),
                )}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Cuisine strip — the structural device. Real counts, and every item
            is a working filter rather than decoration. Full-width, below
            both columns, rather than squeezed into the text column alone. */}
        {cuisines.length > 0 ? (
          <nav
            aria-label={t("browseByCuisine")}
            className="animate-editorial-rise border-t border-white/15 pt-6 lg:col-span-12"
            style={{ animationDelay: "400ms" }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
              {t("browseByCuisine")}
            </p>
            {/* Pills rather than plain links — a filter you can browse
                reads more like navigation when it looks pressable. */}
            <ul className="mt-3 flex flex-wrap gap-2.5">
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
    </div>
  );
}
