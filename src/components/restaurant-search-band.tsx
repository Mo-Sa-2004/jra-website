"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

type Governorate = { slug: string; nameEn: string; nameAr: string | null };

/**
 * The dark "FIND A RESTAURANT" band at the top of `/restaurants`, matching
 * the client's reference directory. A real `NEAR` field there is
 * geolocation-driven free text; JRA's directory doesn't geocode search
 * input, so `NEAR` is a governorate select instead — the same facet the
 * sidebar's "City" field uses, just phrased to match the reference's label.
 * Submitting replaces the URL's `q`/`governorate` outright rather than
 * merging onto whatever the sidebar already set, matching how the
 * reference's own top search resets the page.
 */
export function RestaurantSearchBand({ governorates }: { governorates: Governorate[] }) {
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
    <section className="bg-canvas-deep py-10 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h1 className="font-display text-xl font-bold uppercase tracking-wide text-white sm:text-2xl">
          {t("heroTitle")}
        </h1>

        <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <label className="flex-1 rounded-lg bg-white/10 px-4 py-2.5">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-white/60">
              {t("findLabel")}
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("findPlaceholder")}
              className="mt-0.5 w-full bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
            />
          </label>

          <label className="flex-1 rounded-lg bg-white/10 px-4 py-2.5">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-white/60">
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
    </section>
  );
}
