import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight, Store, Users2 } from "lucide-react";
import { Link } from "@/i18n/navigation";

/**
 * Two large photo tiles, directly under the New Member Banner carousel,
 * splitting the page by audience — the same "pick your path" device
 * rans.ca uses (For Foodie / For Business). JRA's site already carries both
 * audiences, just mixed into one homepage: the public looking for a
 * restaurant, and restaurant/hospitality businesses dealing with the
 * association (classification, training, membership). This doesn't gate
 * anything — both tiles are just prominent links, and everything below
 * (Quick Access, stats, news) still works for either audience. It replaces
 * the search bar that stood here first: the header already carries a
 * restaurant search, and "Find a Restaurant" below points at the same
 * directory, so a second search box in this exact spot was redundant.
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
      href: "/restaurants",
      Icon: Store,
      title: t("gateDinerTitle"),
      subtitle: t("gateDinerSubtitle"),
      image: dinerImage,
    },
    {
      key: "member",
      href: "/membership",
      Icon: Users2,
      title: t("gateMemberTitle"),
      subtitle: t("gateMemberSubtitle"),
      image: memberImage,
    },
  ] as const;

  return (
    <section className="bg-canvas-deep">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:grid-cols-2 sm:px-6 md:px-8 md:py-14">
        {tiles.map(({ key, href, Icon, title, subtitle, image }) => (
          <Link
            key={key}
            href={href}
            className="motion-card group relative flex h-[280px] flex-col justify-end overflow-hidden rounded-3xl border border-white/15 p-6 sm:h-[340px] sm:p-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {image ? (
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
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
          </Link>
        ))}
      </div>
    </section>
  );
}
