"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { DineCuisine } from "@/components/home/cuisine-carousel";

type Governorate = { slug: string; nameEn: string; nameAr: string | null };

/**
 * The "Dine Jordan" hero shared across the Foodie gate's own pages,
 * matching the designer's handover package (dine-shell.css /
 * restaurants.html) on layout: the dark blue gradient with wave-shaped
 * top/bottom edges, the dual overlapping circular photos, and the white
 * pill search panel with a free-text field plus city and cuisine selects.
 * Replaces the previous full-bleed-photo hero that was built before this
 * reference package existed (see git history) -- that one no longer
 * matches anything else on the Foodie side of the site.
 *
 * The search panel's city/cuisine lists are real JRA data (governorates,
 * cuisines), not the designer's own sample set, and submitting routes into
 * the real `/restaurants` directory with the same query params its own
 * filter sidebar reads (`q`, `governorate`, `cuisine`).
 */
export function DiscoverHero({
  governorates,
  cuisines,
}: {
  governorates: Governorate[];
  cuisines: DineCuisine[];
}) {
  const t = useTranslations("home");
  const tRestaurants = useTranslations("restaurants");
  const locale = useLocale();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [cuisine, setCuisine] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (governorate) params.set("governorate", governorate);
    if (cuisine) params.set("cuisine", cuisine);
    const qs = params.toString();
    router.push(qs ? `/restaurants?${qs}` : "/restaurants");
  }

  return (
    <section className="dine-hero">
      <Image
        src="/brand/dine-hero-main.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="dine-hero-backdrop"
      />
      <span className="dine-hero-wave-top" aria-hidden="true" />
      <span className="dine-hero-wave-bottom" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="dine-hero-layout">
          <div className="dine-hero-copy">
            <h1>{t("dineJordanTitle")}</h1>

            <form onSubmit={onSubmit} className="dine-search-panel" role="search">
              <div className="dine-search-fields">
                <label className="dine-search-field">
                  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="10" cy="10" r="7" />
                    <path d="m21 21-6-6" />
                  </svg>
                  <span className="sr-only">{t("dineSearchPlaceholder")}</span>
                  <input
                    type="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={t("dineSearchPlaceholder")}
                    autoComplete="off"
                  />
                </label>

                <label className="dine-search-field">
                  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 9c0 5-7 12-7 12S5 14 5 9a7 7 0 1 1 14 0Z" />
                    <circle cx="12" cy="9" r="2" />
                  </svg>
                  <span className="sr-only">{tRestaurants("cityLabel")}</span>
                  <select value={governorate} onChange={(e) => setGovernorate(e.target.value)}>
                    <option value="">{tRestaurants("allGovernorates")}</option>
                    {governorates.map((g) => (
                      <option key={g.slug} value={g.slug}>
                        {locale === "ar" && g.nameAr ? g.nameAr : g.nameEn}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="dine-search-field">
                  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 2v6a4 4 0 0 0 8 0V2M7 2v20M17 2c-2 3-3 6-3 10h4V2ZM18 12v10" />
                  </svg>
                  <span className="sr-only">{tRestaurants("typeOfCuisineLabel")}</span>
                  <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
                    <option value="">{tRestaurants("allCuisines")}</option>
                    {cuisines.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {locale === "ar" && c.nameAr ? c.nameAr : c.nameEn}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <button type="submit" className="dine-find-btn">
                {t("findRestaurantsCta")}
              </button>
            </form>
          </div>

          <div className="dine-hero-art" aria-hidden="true">
            <div className="dine-photo-orbit dine-photo-main">
              <Image src="/brand/dine-hero-main.webp" alt="" fill sizes="300px" className="object-cover" />
            </div>
            <div className="dine-photo-orbit dine-photo-accent">
              <Image src="/brand/dine-hero-accent.webp" alt="" fill sizes="150px" className="object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
