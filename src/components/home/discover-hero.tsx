"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

type Governorate = { slug: string; nameEn: string; nameAr: string | null };

/**
 * The /discover landing page's hero, matching the client's reference
 * (rans.ca/dinens): a full-bleed photo with the "Find a Restaurant" search
 * band layered directly over it, rather than a separate band below like
 * `/restaurants`' own dark hero (`restaurant-search-band.tsx`) -- same
 * search mechanism and the same `restaurants.*` translation keys, just a
 * different visual treatment to match this specific reference page.
 *
 * The photo is real JRA photography already in the project
 * (`jra-showcase-kitchen.png`, used nowhere else) rather than stock imagery
 * or an attempt to pull from JRA's live social accounts, which this
 * environment has no credentialed access to.
 */
export function DiscoverHero({ governorates }: { governorates: Governorate[] }) {
  const t = useTranslations("restaurants");
  const locale = useLocale();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [governorate, setGovernorate] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (governorate) params.set("governorate", governorate);
    const qs = params.toString();
    router.push(qs ? `/restaurants?${qs}` : "/restaurants");
  }

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[360px] w-full sm:h-[420px]">
        <Image
          src="/brand/jra-showcase-kitchen.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Blue rather than the reference's plain black wash -- the same
            canvas-deep used on /restaurants' own search band, so the two
            search entry points read as one family. */}
        <div className="absolute inset-0 bg-gradient-to-t from-canvas-deep via-canvas-deep/40 to-canvas-deep/10" />
      </div>

      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto max-w-5xl px-4 pb-6 sm:px-6 sm:pb-8">
          <h1 className="font-display text-lg font-bold uppercase tracking-wide text-white sm:text-xl">
            {t("heroTitle")}
          </h1>

          <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <label className="flex-1 rounded-lg bg-white/15 px-4 py-2.5 backdrop-blur-sm">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-white/70">
                {t("findLabel")}
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("findPlaceholder")}
                className="mt-0.5 w-full bg-transparent text-sm text-white placeholder:text-white/60 focus:outline-none"
              />
            </label>

            <label className="flex-1 rounded-lg bg-white/15 px-4 py-2.5 backdrop-blur-sm">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-white/70">
                {t("nearLabel")}
              </span>
              <select
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                className="mt-0.5 w-full bg-transparent text-sm text-white focus:outline-none [&>option]:text-ink"
              >
                <option value="">{t("allGovernorates")}</option>
                {governorates.map((g) => (
                  <option key={g.slug} value={g.slug}>
                    {locale === "ar" && g.nameAr ? g.nameAr : g.nameEn}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              className="shrink-0 rounded-lg bg-white px-8 py-3 text-sm font-bold uppercase tracking-wide text-canvas-deep transition-colors hover:bg-white/90"
            >
              {t("findButton")}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
