import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type GateImage = { url: string; alt: string } | null;

/**
 * The homepage's only content: two tiles splitting the site by audience —
 * matching the composition of rans.ca's own gate (a photo tile, a bold
 * centred title, a divider rule, then a row of sub-links), not just the
 * idea of one. `[locale]/page.tsx` renders nothing else.
 *
 * Each tile's artwork is a small grid of real member photos (a "wall" of up
 * to 6 real restaurants on the foodie tile, real suppliers/businesses on
 * the member tile) rather than one single photo stretched across the whole
 * tile. Two reasons: it matches the multi-photo collage look the client
 * pointed to as a reference, and a grid of small cells hides a low-res
 * source photo (plenty of member photos on file are closer to a logo than a
 * venue shot) far better than one giant crop does — same fix applied to the
 * `/discover` hero banner, see `new-member-banner.tsx`.
 *
 * Plain next-intl `Link`s throughout, no cookie and no middleware redirect
 * (an earlier version remembered the choice and skipped the gate on return
 * visits — removed because it broke the browser back button: landing back
 * on "/" after choosing a side would immediately bounce you forward again).
 * So every visit to "/" shows the gate, same as rans.ca, and back/forward
 * both behave like any other link.
 *
 * Each tile is two separate link regions rather than one big anchor: the
 * photo grid+title opens that audience's homepage, and the three sub-links
 * below it jump straight to a specific page within that side — matching
 * rans.ca, where "Restaurants / Events / Trends" and "Industry / Members /
 * Operations" are real deep links, not decoration.
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
    <div className="flex min-h-[calc(100svh-64px)] flex-col justify-center bg-surface-2">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 md:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {t("gateKicker")}
        </p>
        <h1 className="mt-2 text-center font-editorial text-[clamp(1.6rem,3.5vw,2.25rem)] font-semibold leading-tight text-ink rtl:font-display">
          {t("gateTitle")}
        </h1>

        <div className="relative mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-rule bg-rule">
          {tiles.map(({ key, href, title, images, links }) => {
            const cells: GateImage[] = Array.from({ length: 6 }, (_, i) => images[i] ?? null);
            return (
              <div key={key} className="flex flex-col bg-surface">
                <Link href={href} className="motion-card group relative block h-[180px] overflow-hidden sm:h-[240px]">
                  <div className="grid h-full grid-cols-3 grid-rows-2 gap-px bg-rule">
                    {cells.map((image, i) => (
                      <div key={i} className="relative overflow-hidden bg-surface-2">
                        {image ? (
                          <Image
                            src={image.url}
                            alt=""
                            fill
                            sizes="(min-width: 640px) 17vw, 17vw"
                            priority={i === 0}
                            className="motion-card-image object-cover"
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                  {/* Light wash rather than a dark scrim — the title sits on
                      top in dark ink, not white, so the photo grid needs to
                      read as background texture rather than a lit subject. */}
                  <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/75 to-paper/40" />
                  <span className="absolute inset-x-2 bottom-3 text-center font-display text-base font-bold text-ink sm:text-xl md:text-2xl">
                    {title}
                  </span>
                </Link>

                <nav
                  aria-label={title}
                  className="flex flex-1 items-center justify-center gap-1.5 border-t border-rule px-2 py-3 text-center sm:gap-2.5 sm:py-4"
                >
                  {links.map((link, i) => (
                    <span key={link.href} className="flex items-center gap-1.5 sm:gap-2.5">
                      {i > 0 ? <span className="text-ink-faint" aria-hidden="true">|</span> : null}
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
