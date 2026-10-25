import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight, Store, Users2 } from "lucide-react";

/**
 * The homepage's only content: two large photo tiles splitting the site by
 * audience, the same "pick your path" device rans.ca uses (For Foodie / For
 * Business). JRA's site carries both audiences — the public looking for a
 * restaurant, and restaurant/hospitality businesses dealing with the
 * association — so this is a real hard gate: `[locale]/page.tsx` renders
 * nothing else, and `middleware.ts` skips straight past it for a returning
 * visitor who already picked a side (see `[locale]/gate/route.ts`, which
 * each tile links to).
 *
 * Square flat tiles rather than rans.ca's circles — circles don't appear
 * anywhere else in this design system, and introducing the shape in one
 * spot would read as a different site bolted on rather than the same
 * system flexing.
 */
export async function AudienceGate({
  dinerImage,
  memberImage,
}: {
  dinerImage: { url: string; alt: string } | null;
  memberImage: { url: string; alt: string } | null;
}) {
  const t = await getTranslations("home");

  const tiles = [
    {
      key: "diner",
      href: "/gate?to=diner",
      Icon: Store,
      title: t("gateDinerTitle"),
      subtitle: t("gateDinerSubtitle"),
      image: dinerImage,
    },
    {
      key: "member",
      href: "/gate?to=member",
      Icon: Users2,
      title: t("gateMemberTitle"),
      subtitle: t("gateMemberSubtitle"),
      image: memberImage,
    },
  ] as const;

  return (
    <div className="flex min-h-[calc(100svh-64px)] flex-col justify-center bg-canvas-deep">
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 md:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-brass">
          {t("gateKicker")}
        </p>
        <h1 className="mt-3 text-center font-editorial text-[clamp(1.9rem,4.5vw,3rem)] font-semibold leading-tight text-white rtl:font-display">
          {t("gateTitle")}
        </h1>

        <div className="stagger mt-10 grid gap-4 sm:grid-cols-2">
          {tiles.map(({ key, href, Icon, title, subtitle, image }) => (
            // Plain <a>, not next-intl's Link: this needs to hit the route
            // handler (a GET that sets a cookie and redirects) rather than
            // a client-side route transition.
            <a
              key={key}
              href={href}
              className="motion-card group relative flex h-[300px] flex-col justify-end overflow-hidden rounded-3xl border border-white/15 p-6 sm:h-[380px] sm:p-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {image ? (
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  priority
                  className="motion-card-image object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-canvas-deep-2 to-canvas-deep" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5" />

              <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="relative mt-4 font-display text-2xl font-semibold text-white sm:text-3xl">
                {title}
              </h2>
              <p className="relative mt-2 max-w-sm text-sm leading-relaxed text-white/75">
                {subtitle}
              </p>
              <span className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                {t("gateCta")}
                <ArrowUpRight className="cta-arrow h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
