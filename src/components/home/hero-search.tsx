"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, ArrowRight } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

/**
 * The hero's primary action.
 *
 * On a directory, search *is* the call to action — the previous hero led with
 * two buttons and buried search behind an icon in the header. This puts it
 * where the eye lands.
 */
export function HeroSearch() {
  const t = useTranslations("home");
  const router = useRouter();
  const [value, setValue] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        router.push(q ? `/restaurants?q=${encodeURIComponent(q)}` : "/restaurants");
      }}
      // Solid rather than glass: translucent-over-photography read fine on
      // some corridor images and washed-out on others, since the panel's own
      // contrast depended on whatever happened to be behind it. A near-opaque
      // panel gives the search bar its own fixed contrast regardless of the
      // photo underneath.
      className="group flex items-center gap-2 rounded-full border border-rule bg-surface/95 p-1.5 ps-5 backdrop-blur-md transition-colors focus-within:border-accent"
    >
      <Search className="h-5 w-5 shrink-0 text-ink-faint" aria-hidden="true" />
      <label htmlFor="hero-search" className="sr-only">
        {t("heroSearchLabel")}
      </label>
      <input
        // Form-filling extensions stamp attributes like fdprocessedid onto
        // inputs and buttons before React hydrates, which reports as a
        // mismatch the app cannot fix. The header's own search already
        // carries this for the same reason.
        id="hero-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("heroSearchPlaceholder")}
        // 16px minimum, or iOS zooms the page on focus.
        className="min-w-0 flex-1 bg-transparent py-3 text-base text-ink placeholder:text-ink-faint focus:outline-none"
      />
      <button
        type="submit"
        aria-label={t("heroSearchLabel")}
        className="flex size-[44px] shrink-0 items-center justify-center rounded-full bg-accent text-white transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ArrowRight className="h-5 w-5 rtl:-scale-x-100" aria-hidden="true" />
      </button>
    </form>
  );
}
