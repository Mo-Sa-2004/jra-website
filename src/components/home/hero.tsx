import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HeroSearch } from "@/components/home/hero-search";
import { ImageStreamHero } from "@/components/ui/image-stream-hero";

/**
 * Homepage hero.
 *
 * The previous version was a white card floating over a blurred backdrop, with
 * the association described in prose and two buttons beneath it. It told you
 * JRA represents Jordan's restaurants. This shows them: a corridor of real
 * member photography running toward the viewer, search as the primary action,
 * and the cuisine strip doing double duty as proof of range and as navigation.
 *
 * Dark ground on purpose — food photography reads better against it, and it
 * gives the page a distinct opening register before settling into the light
 * editorial layout below.
 *
 * Governorates were the first candidate for the strip, but three of them hold
 * no restaurants and 288 listings have none assigned, so it would have
 * advertised the gap rather than the reach. Cuisine covers 78% and spreads
 * properly.
 */

export type HeroCuisine = { slug: string; label: string; count: number };

/**
 * The corridor renders plain <img> rather than next/image, so nothing resizes
 * these for us. Eighteen full-resolution restaurant photos would be several
 * megabytes on first paint; the cards are ~18% of the container's width, so a
 * 420px derivative is already more than enough. Cloudinary does the work in
 * the URL. Non-Cloudinary sources (local dev uploads) pass through untouched.
 */
function thumb(url: string): string {
  const marker = "/image/upload/";
  const at = url.indexOf(marker);
  if (at === -1) return url;
  const head = url.slice(0, at + marker.length);
  const tail = url.slice(at + marker.length);
  return `${head}w_420,h_560,c_fill,g_auto,q_auto,f_auto/${tail}`;
}

export async function HomeHero({
  images,
  cuisines,
  restaurantCount,
}: {
  images: { url: string; alt: string }[];
  cuisines: HeroCuisine[];
  restaurantCount: number;
}) {
  const t = await getTranslations("home");

  const stream = images.map((i) => ({ src: thumb(i.url), alt: i.alt }));

  return (
    // Flat navy ground rather than the corridor itself being the hero's
    // full-bleed background. The corridor now lives in its own framed panel
    // in the right column below — running the full photography behind the
    // text was drowning the heading and search out on wide screens, and
    // needed two full-hero scrim gradients just to keep the text readable
    // over whatever happened to be moving behind it. A flat background needs
    // no scrim at all, which is why both are gone.
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

        {/* The corridor's own frame. It scales itself to whatever container
            it's given — every length inside is `cqw`, a percentage of this
            box's width — so shrinking it to a column here shrinks the whole
            effect with it rather than cropping a full-size one. The mask
            fades the top and bottom edges rather than letting cards appear
            and disappear on a hard line. */}
        <div className="animate-editorial-rise lg:col-span-5" style={{ animationDelay: "200ms" }}>
          <div className="relative h-[380px] overflow-hidden rounded-2xl border border-white/10 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] sm:h-[420px]">
            <ImageStreamHero
              images={stream}
              // Fewer, larger cards than the old full-bleed version (was 9) —
              // a dense corridor read as texture at full width; the same
              // density in a column this narrow reads as clutter.
              cards={5}
              speed={26}
              axis={50}
              className="h-full w-full"
            />
          </div>
        </div>

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
