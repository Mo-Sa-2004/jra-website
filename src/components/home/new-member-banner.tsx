"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, MapPin, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";

export type BannerRestaurant = {
  slug: string;
  name: string;
  imageUrl: string | null;
  location: string | null;
  isNew: boolean;
};

/**
 * "02 DYNAMIC NEW MEMBER RESTAURANTS BANNER" from the client's wireframe: an
 * auto-rotating, slow carousel of the newest approved member restaurants,
 * with manual arrows and dot navigation, each slide opening that
 * restaurant's own page. Replaces the previous marketing hero entirely —
 * this section's whole point, per the handover doc, is real, current member
 * data rather than copywriting.
 */
export function NewMemberBanner({ restaurants }: { restaurants: BannerRestaurant[] }) {
  const t = useTranslations();
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const count = restaurants.length;

  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (count <= 1) return;
    timer.current = setInterval(() => go(index + 1), 6000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, count]);

  if (count === 0) return null;

  return (
    <section
      aria-label={t("home.newMemberBanner")}
      className="relative overflow-hidden bg-canvas-deep"
      onMouseEnter={() => {
        if (timer.current) clearInterval(timer.current);
      }}
      onMouseLeave={() => go(index + 1)}
    >
      <div className="relative h-[320px] w-full sm:h-[400px] lg:h-[460px]">
        {restaurants.map((r, i) => (
          <Link
            key={r.slug}
            href={`/restaurants/${r.slug}`}
            aria-hidden={i !== index}
            tabIndex={i === index ? 0 : -1}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {r.imageUrl ? (
              <Image
                src={r.imageUrl}
                alt={r.name}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-canvas-deep to-canvas-deep-2" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-10 sm:px-6 md:px-8">
              {r.isNew ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  {t("home.newBadge")}
                </span>
              ) : null}
              <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold text-white sm:text-4xl">
                {r.name}
              </h2>
              {r.location ? (
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-white/75">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {r.location}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label={t("common.previous")}
            className="absolute start-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ChevronRight className="h-5 w-5 rtl:hidden" aria-hidden="true" />
            <ChevronLeft className="hidden h-5 w-5 rtl:block" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label={t("common.next")}
            className="absolute end-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ChevronLeft className="h-5 w-5 rtl:hidden" aria-hidden="true" />
            <ChevronRight className="hidden h-5 w-5 rtl:block" aria-hidden="true" />
          </button>

          <div className="absolute bottom-4 start-1/2 z-10 flex -translate-x-1/2 gap-2 rtl:translate-x-1/2">
            {restaurants.map((r, i) => (
              <button
                key={r.slug}
                type="button"
                onClick={() => go(i)}
                aria-label={`${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
