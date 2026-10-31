import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { PriceTier } from "@prisma/client";
import { MapPin, ArrowRight, Star, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cx } from "@/lib/ui";

export type RestaurantCardData = {
  slug: string;
  name: string;
  nameAr: string | null;
  shortDescription: string | null;
  imageUrl: string | null;
  /**
   * A second, separately-uploaded photo. Most listings only have the one
   * image — usually a logo — so this is null far more often than not; the
   * card falls back to the plain single-image treatment when it is.
   */
  coverImageUrl: string | null;
  governorateName: string | null;
  governorateNameAr?: string | null;
  cuisineName: string | null;
  cuisineNameAr?: string | null;
  stars: number | null;
  priceTier: PriceTier;
  /**
   * The real phone number and address, not just a yes/no flag -- see
   * `hasPhone`/`hasHours` below for why a boolean badge was removed
   * earlier. The directory now holds real contact data for ~65% of
   * listings, so most cards render these; the rest render without them.
   */
  phone: string | null;
  addressText: string | null;
  /** No longer rendered on the card — kept on the type so
   *  `getFeaturedRestaurants` and the directory query need not change in
   *  the same commit. */
  hasPhone?: boolean;
  hasHours?: boolean;
};

// Blue/gray only, not the full design-system palette (olive, brass) --
// scoped to the directory's own blue/white/gray treatment rather than the
// site's general brand colors, same reasoning as the gate's EMPTY_CELL_TINTS.
const PLACEHOLDER_HUES = [
  "from-accent/25 to-accent/5",
  "from-gray-300/60 to-gray-100/40",
  "from-accent/15 to-gray-200/50",
];

function placeholderGradient(seed: string) {
  const idx = seed.charCodeAt(0) % PLACEHOLDER_HUES.length;
  return PLACEHOLDER_HUES[idx];
}

export function RestaurantCard({ restaurant }: { restaurant: RestaurantCardData }) {
  const locale = useLocale();
  const ar = locale === "ar";
  const tCommon = useTranslations("common");
  const tPriceTier = useTranslations("priceTier");
  const displayName = (ar && restaurant.nameAr) || restaurant.name;

  const governorate = (ar && restaurant.governorateNameAr) || restaurant.governorateName;
  const cuisine = (ar && restaurant.cuisineNameAr) || restaurant.cuisineName;
  const phone = restaurant.phone;
  const address = restaurant.addressText;
  const priceLabel = restaurant.priceTier !== "UNKNOWN" ? tPriceTier(restaurant.priceTier) : null;
  const cover = restaurant.coverImageUrl;
  const logo = restaurant.imageUrl;

  return (
    <Link
      href={`/restaurants/${restaurant.slug}`}
      // flex + h-full so every card in a row matches height regardless of how
      // much meta text it carries, with the "learn more" row anchored to the
      // bottom (mt-auto below) rather than floating wherever the content ends.
      // The lift + border tint on hover stand in for a drop shadow — the
      // design system runs flat, with no shadows anywhere else on the site.
      className="motion-card group flex h-full flex-col overflow-hidden rounded-2xl border border-rule bg-surface transition-transform duration-300 hover:-translate-y-1 hover:border-accent/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {cover && logo ? (
        <div className="relative h-44 w-full shrink-0 overflow-hidden bg-surface-2">
          <Image
            src={cover}
            alt=""
            fill
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
            className="motion-card-image object-cover"
          />
          {/* The venue's own mark, over its own photo — a badge overlapping
              the corner rather than two competing full-width images stacked
              on top of each other. */}
          <div className="absolute -bottom-6 start-4 h-14 w-14 overflow-hidden rounded-full border-2 border-surface bg-surface-2 p-1 ring-1 ring-rule">
            <Image src={logo} alt="" fill sizes="56px" className="object-contain" />
          </div>
          {restaurant.stars ? (
            <div className="absolute end-2.5 top-2.5 flex items-center gap-1 rounded-full bg-ink/80 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
              <Star className="h-3 w-3 fill-brass text-brass" aria-hidden="true" />
              {restaurant.stars}
            </div>
          ) : null}
        </div>
      ) : (
        // 16:9 rather than a taller crop — a 4:3 image made the picture three
        // quarters of the card, and at 16:9 three rows fit a laptop screen.
        // Uploaded images are mostly business logos of wildly different
        // shapes (square marks, wide wordmarks, circular badges), not
        // uniform wide photos, so object-cover was cropping into them
        // unpredictably. object-contain + padding shows each one whole,
        // centered on a neutral fill, so the grid reads as one system
        // instead of a set of random crops.
        <div className="relative aspect-[16/9] shrink-0 overflow-hidden bg-surface-2 p-3">
          {logo ? (
            <Image
              src={logo}
              alt=""
              fill
              sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
              className="motion-card-image object-contain"
            />
          ) : (
            <div
              className={`motion-card-image flex h-full w-full items-center justify-center bg-gradient-to-br ${placeholderGradient(
                restaurant.name
              )}`}
            >
              <span aria-hidden="true" className="font-display text-3xl text-ink/30">
                {displayName.trim().charAt(0)}
              </span>
            </div>
          )}
          {restaurant.stars ? (
            <div className="absolute end-2.5 top-2.5 flex items-center gap-1 rounded-full bg-ink/80 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
              <Star className="h-3 w-3 fill-brass text-brass" aria-hidden="true" />
              {restaurant.stars}
            </div>
          ) : null}
        </div>
      )}

      <div className={cx("flex flex-1 flex-col p-4", cover && logo && "pt-8")}>
        <h3 className="truncate font-display font-semibold text-lg text-ink transition-colors group-hover:text-accent">
          {displayName}
        </h3>

        {/* Real contact signals, not the old yes/no badge -- a number and
            an address someone can actually use, same as every card on the
            reference directory. Plain text rather than a `tel:` link: the
            whole card is already one big link to the detail page, and a
            link can't nest inside another link. */}
        {phone ? (
          <p className="mt-1.5 flex items-center gap-1.5 truncate text-sm text-ink-soft" dir="ltr">
            <Phone className="h-3.5 w-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
            {phone}
          </p>
        ) : null}

        {address || governorate ? (
          <p className="mt-1.5 flex items-center gap-1.5 truncate text-sm text-ink-soft">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
            {address || governorate}
          </p>
        ) : null}

        {cuisine || priceLabel ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {cuisine ? (
              <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                {cuisine}
              </span>
            ) : null}
            {priceLabel ? (
              <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-soft">
                {priceLabel}
              </span>
            ) : null}
          </div>
        ) : null}

        <span className="mt-auto flex items-center gap-1 pt-4 text-sm font-medium text-accent">
          {tCommon("learnMore")}
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}
