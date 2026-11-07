import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ORG } from "@/lib/organisation";

type GateVariant = "photo" | "photo-wide" | "seeker";

type GateTile = {
  key: string;
  href: string;
  titleKey: "gateDinerTitle" | "gateMemberTitle" | "gateSeekersTitle";
  variant: GateVariant;
  image?: string;
  imagePosition?: string;
};

const TILES: GateTile[] = [
  {
    key: "foodie",
    href: "/discover",
    titleKey: "gateDinerTitle",
    variant: "photo",
    image: "/brand/jra-showcase-kitchen.png",
    imagePosition: "50% 62%",
  },
  {
    key: "business",
    href: "/for-members",
    titleKey: "gateMemberTitle",
    variant: "photo-wide",
    image: "/brand/jra-showcase-board.png",
    imagePosition: "50% 32%",
  },
  {
    key: "seekers",
    href: "/jobs",
    titleKey: "gateSeekersTitle",
    variant: "seeker",
  },
];

/**
 * The homepage's only content: three circular "portal" tiles splitting the
 * site by audience. Rebuilt in November 2026 to match the unified visual
 * identity the client's designer, Ibrahim Nassrallah, sent over WhatsApp as
 * a static demo (JRA-website.zip — index.html + homepage.css) rather than
 * the earlier rans.ca-style two-card gate this replaces.
 *
 * Three overlapping circles rather than two side-by-side cards: Foodie,
 * an enlarged centered Business, and a new third option, Seekers, that the
 * reference introduces (job seekers heading straight to SiyahaJobs, rather
 * than that link living three levels deep in the foodie side's sub-nav as
 * it used to). The business circle stays visually enlarged and centered
 * even under Arabic — see the `.gate-portals { direction: ltr }` rule in
 * globals.css, which is the reference's own deliberate choice, kept for the
 * same reason: the overlap math is tuned for a fixed left-to-right order,
 * not a general RTL rule.
 *
 * `SiteHeader`/`SiteFooter` already render nothing on "/" (see
 * site-header.tsx / site-footer.tsx), so this component supplies its own
 * minimal brand lockup and language switcher — matching the reference's
 * own standalone header, but reusing the site's real `LocaleSwitcher`
 * rather than rebuilding a bespoke EN/AR toggle.
 *
 * Each circle is one full-bleed photo rather than the previous design's
 * 6-photo grid. The reference's own Foodie/Business photos
 * (restaurants.webp / industry.webp) aren't part of this repo, so these use
 * the real JRA photography already on hand in public/brand instead: the
 * plated-dish kitchen shot for Foodie, the board/membership photo for
 * Business. Seekers uses SiyahaJobs' own mark, copied unchanged from the
 * reference's assets/siyahajobs-symbol.png into
 * public/brand/siyahajobs-mark.png — it's SiyahaJobs' existing public logo,
 * not artwork invented for this page.
 */
export async function AudienceGate() {
  const t = await getTranslations("home");
  const tFooter = await getTranslations("footer");
  const tCommon = await getTranslations("common");

  return (
    <div className="gate-page relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-white">
      <svg
        aria-hidden="true"
        focusable="false"
        className="gate-corner gate-corner-top"
        viewBox="0 0 800 440"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="gate-corner-top" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#003f7a" />
            <stop offset=".5" stopColor="#0053a0" />
            <stop offset="1" stopColor="#6fb4ec" />
          </linearGradient>
        </defs>
        <path d="M0 0H590C330 75 125 170 0 340Z" fill="url(#gate-corner-top)" />
        <path d="M0 318C170 122 340 65 590 0H545C285 58 120 165 0 300Z" fill="#fff" />
        <path d="M0 300C140 120 300 50 440 0H350C195 70 75 180 0 280Z" fill="#6fb4ec" fillOpacity=".4" />
      </svg>
      <svg
        aria-hidden="true"
        focusable="false"
        className="gate-corner gate-corner-bottom"
        viewBox="0 0 800 440"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="gate-corner-bottom" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#003f7a" />
            <stop offset=".5" stopColor="#0053a0" />
            <stop offset="1" stopColor="#6fb4ec" />
          </linearGradient>
        </defs>
        <path d="M0 0H590C330 75 125 170 0 340Z" fill="url(#gate-corner-bottom)" />
        <path d="M0 318C170 122 340 65 590 0H545C285 58 120 165 0 300Z" fill="#fff" />
        <path d="M0 300C140 120 300 50 440 0H350C195 70 75 180 0 280Z" fill="#6fb4ec" fillOpacity=".4" />
      </svg>

      {/* Visually hidden — the circles below carry the visible content, but
          the page still needs a real heading for screen readers and SEO. */}
      <h1 className="sr-only">{tCommon("associationName")}</h1>

      <div className="absolute end-4 top-4 z-20 sm:end-6 sm:top-5">
        <LocaleSwitcher />
      </div>

      <header className="relative z-10 flex shrink-0 items-center justify-center py-7 sm:py-9">
        <Image
          src={ORG.brand.logo}
          alt=""
          width={240}
          height={46}
          priority
          className="h-14 w-auto sm:h-[72px]"
        />
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-10 sm:px-6">
        <div className="gate-portals flex w-full max-w-[1400px] flex-col items-center gap-7 sm:flex-row sm:gap-0">
          {TILES.map((tile) => (
            <div key={tile.key} className={`gate-orbit gate-orbit-${tile.key}`}>
              <span aria-hidden="true" className="gate-orbit-ring">
                <svg viewBox="0 0 100 100" focusable="false">
                  <defs>
                    <linearGradient id={`gate-ring-${tile.key}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#0053a0" stopOpacity=".12" />
                      <stop offset=".5" stopColor="#0053a0" />
                      <stop offset="1" stopColor="#6fb4ec" stopOpacity=".5" />
                    </linearGradient>
                  </defs>
                  <path
                    className="gate-orbit-arc"
                    d="M50 0A50 50 0 0 1 93.301 75M25 93.301A50 50 0 0 1 0 50"
                    stroke={`url(#gate-ring-${tile.key})`}
                  />
                </svg>
              </span>

              <Link href={tile.href} className={`gate-portal gate-portal-${tile.variant}`}>
                {tile.variant === "seeker" ? (
                  <span className="gate-portal-seeker-mark">
                    <Image
                      src="/brand/siyahajobs-mark.png"
                      alt=""
                      fill
                      sizes="180px"
                      className="object-contain"
                    />
                  </span>
                ) : (
                  <Image
                    src={tile.image!}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 32vw, 80vw"
                    className="gate-portal-photo"
                    style={{ objectPosition: tile.imagePosition }}
                  />
                )}
                <span className="gate-portal-scrim" aria-hidden="true" />
                <span className="gate-portal-copy">
                  <h2 className="gate-portal-title">{t(tile.titleKey)}</h2>
                  <span className="gate-portal-arrow" aria-hidden="true">
                    <ArrowRight className="h-5 w-5 rtl:-scale-x-100" strokeWidth={1.8} />
                  </span>
                </span>
              </Link>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 shrink-0 pb-8 pt-2 text-center text-xs text-ink-faint">
        © {new Date().getFullYear()} {tFooter("legalName")}. {tFooter("rights")}
      </footer>
    </div>
  );
}
