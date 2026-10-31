import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type GateImage = { url: string; alt: string } | null;

/**
 * Cells without a real photo yet (not every restaurant/supplier has one on
 * file) fall back to a soft wash instead of a flat empty panel — a blank
 * grey square read as broken rather than deliberate. Blue/white/gray is the
 * client's palette for this page specifically (confirmed in the October
 * 2026 client meeting, replacing an earlier blue/white/pink pass once pink
 * was ruled out), not the site's general brand colors, so it stays scoped
 * to the gate rather than bleeding into the rest of the design system.
 * Cycled by index so a run of empty cells in the same tile doesn't read as
 * one flat block.
 */
const EMPTY_CELL_TINTS = [
  "bg-gradient-to-br from-blue-100 via-white to-gray-200",
  "bg-gradient-to-tr from-gray-200 via-white to-blue-100",
  "bg-gradient-to-b from-blue-50 via-white to-gray-100",
] as const;

/**
 * The homepage's only content: two tiles splitting the site by audience,
 * built to match rans.ca's own gate — per the client's October 2026
 * direction, literally "copy the exact same design" of
 * https://rans.ca/, in JRA's own colors (blue/white/gray, no pink).
 * `[locale]/page.tsx` renders nothing else.
 *
 * rans.ca's cards are two separate floating cards (real gap between them,
 * each independently rounded and shadowed) rather than one shared strip
 * split by a divider — that's the one deliberate break from the rest of
 * the site's flat, shadow-free card system (see globals.css), kept scoped
 * to this component to match the reference. Each card is a photo with a
 * circular logo seal centered on it (rans.ca uses "DINE NOVA SCOTIA" /
 * "RANS" sub-brand seals; JRA has no equivalent sub-brands, so both tiles
 * use JRA's own icon mark — same logo, not two invented identities), a
 * bold title below the photo, then a row of sub-links.
 *
 * The photo itself is still the 6-cell grid of real member photos (not a
 * single photo like rans.ca) — that was the fix for low-res source photos
 * blurring when stretched full-bleed (see the commit history on this
 * file), and reverting to one photo per card would reopen that problem.
 * The grid still reads as "a wall of real places" under the seal, which is
 * close enough to the reference's intent without the blur risk.
 *
 * Plain next-intl `Link`s throughout, no cookie and no middleware redirect
 * (an earlier version remembered the choice and skipped the gate on return
 * visits — removed because it broke the browser back button). Every visit
 * to "/" shows the gate, and back/forward both behave like any other link.
 *
 * Each tile is two separate link regions: the photo+seal+title opens that
 * audience's homepage, and the three sub-links below it jump straight to a
 * specific page within that side — matching rans.ca's own "Restaurants /
 * Events / Trends" and "Industry / Members / Operations" rows, which are
 * real deep links, not decoration.
 */
export async function AudienceGate({
  dinerImages,
  memberImages,
}: {
  dinerImages: GateImage[];
  memberImages: GateImage[];
}) {
  const t = await getTranslations("home");
  const tNav = await getTranslations("nav");

  const tiles = [
    {
      key: "diner",
      href: "/discover",
      title: t("gateDinerTitle"),
      images: dinerImages,
      links: [
        { label: tNav("restaurants"), href: "/restaurants" },
        { label: tNav("news"), href: "/news" },
        { label: t("siyahaJobs"), href: "/jobs" },
      ],
    },
    {
      key: "member",
      href: "/for-members",
      title: t("gateMemberTitle"),
      images: memberImages,
      links: [
        { label: tNav("membership"), href: "/membership" },
        { label: tNav("suppliers"), href: "/suppliers" },
        { label: tNav("training"), href: "/training" },
      ],
    },
  ] as const;

  return (
    <div className="flex min-h-[calc(100svh-64px)] flex-col justify-center bg-gradient-to-br from-blue-50 via-white to-gray-100">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 md:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {t("gateKicker")}
        </p>
        <h1 className="mt-2 text-center font-editorial text-[clamp(1.6rem,3.5vw,2.25rem)] font-semibold leading-tight text-ink rtl:font-display">
          {t("gateTitle")}
        </h1>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
          {tiles.map(({ key, href, title, images, links }) => {
            const cells: GateImage[] = Array.from({ length: 6 }, (_, i) => images[i] ?? null);
            return (
              <div
                key={key}
                className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-xl shadow-blue-950/10 ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1"
              >
                <Link href={href} className="group block overflow-hidden">
                  {/* Full-color photo grid, no wash — a faded, veiled version
                      of real member photos looked worse than the blur it
                      was meant to fix. The title gets its own plain block
                      below instead of fighting the photos for contrast.
                      `relative` lives on this wrapper, not the outer Link,
                      so the seal below centers on the photo area only —
                      not the title text underneath it too. */}
                  <div className="relative">
                    <div className="grid h-[180px] grid-cols-3 grid-rows-2 gap-px overflow-hidden bg-gray-200 sm:h-[220px]">
                      {cells.map((_image, i) => (
                        // Real member photos are temporarily suppressed here
                        // per the client's "keep the squares empty for now"
                        // direction -- every cell renders the tint
                        // placeholder regardless of whether a photo exists.
                        // Re-enable by restoring the `image ? <Image .../>`
                        // branch this replaced.
                        <div
                          key={i}
                          className={`relative overflow-hidden ${EMPTY_CELL_TINTS[i % EMPTY_CELL_TINTS.length]}`}
                        />
                      ))}
                    </div>

                    {/* Circular seal, centered over the photo — rans.ca's
                        own composition (a round sub-brand badge over the
                        hero photo). `jra-mark.png` itself is a tight crop
                        of just the swirl's right lobe (used elsewhere as a
                        small favicon-style mark), so it read as cut off
                        here. `jra-mark-full.png` is the complete swirl,
                        cropped out of the wordmark lockup (`jra-logo.png`)
                        with the "JRA | Jordan Restaurant Association" text
                        dropped — the full icon, no words. */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="relative h-16 w-16 rounded-full bg-white p-3 shadow-md ring-1 ring-black/5 sm:h-20 sm:w-20">
                        <Image
                          src="/brand/jra-mark-full.png"
                          alt=""
                          fill
                          sizes="80px"
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="px-3 pb-1 pt-4 text-center font-display text-lg font-bold text-ink sm:text-xl md:text-2xl">
                    {title}
                  </p>
                </Link>

                <nav
                  aria-label={title}
                  className="flex flex-1 items-center justify-center gap-1.5 border-t border-gray-100 px-2 py-3 text-center sm:gap-2.5 sm:py-4"
                >
                  {links.map((link, i) => (
                    <span key={link.href} className="flex items-center gap-1.5 sm:gap-2.5">
                      {i > 0 ? <span className="text-gray-300" aria-hidden="true">|</span> : null}
                      <Link
                        href={link.href}
                        className="text-[11px] font-semibold text-ink-soft transition-colors hover:text-accent sm:text-xs"
                      >
                        {link.label}
                      </Link>
                    </span>
                  ))}
                </nav>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
