import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/**
 * The homepage's only content: two tiles splitting the site by audience —
 * matching the composition of rans.ca's own gate (a photo tile, a bold
 * centred title, a divider rule, then a row of sub-links), not just the
 * idea of one. `[locale]/page.tsx` renders nothing else.
 *
 * Plain next-intl `Link`s throughout, no cookie and no middleware redirect
 * (an earlier version remembered the choice and skipped the gate on return
 * visits — removed because it broke the browser back button: landing back
 * on "/" after choosing a side would immediately bounce you forward again).
 * So every visit to "/" shows the gate, same as rans.ca, and back/forward
 * both behave like any other link.
 *
 * Each tile is two separate link regions rather than one big anchor: the
 * photo+title opens that audience's homepage, and the three sub-links below
 * it jump straight to a specific page within that side — matching rans.ca,
 * where "Restaurants / Events / Trends" and "Industry / Members /
 * Operations" are real deep links, not decoration.
 */
export async function AudienceGate({
  dinerImage,
  memberImage,
}: {
  dinerImage: { url: string; alt: string } | null;
  memberImage: { url: string; alt: string } | null;
}) {
  const t = await getTranslations("home");
  const tNav = await getTranslations("nav");

  const tiles = [
    {
      key: "diner",
      href: "/discover",
      title: t("gateDinerTitle"),
      image: dinerImage,
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
      image: memberImage,
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
          {tiles.map(({ key, href, title, image, links }) => (
            <div key={key} className="flex flex-col bg-surface">
              <Link href={href} className="motion-card group relative block h-[180px] overflow-hidden sm:h-[240px]">
                {image ? (
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 640px) 50vw, 50vw"
                    priority
                    className="motion-card-image object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-surface-2" />
                )}
                {/* Light wash rather than a dark scrim — the title sits on
                    top in dark ink, not white, so the photo needs to read
                    as background texture rather than a lit subject. */}
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
          ))}
        </div>
      </div>
    </div>
  );
}
