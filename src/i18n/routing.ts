import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  localePrefix: "always",
  // Without this, an unprefixed request (someone's first visit to the
  // bare domain) negotiates a locale from the browser's Accept-Language
  // header instead of using `defaultLocale` -- a visitor with Arabic as
  // their browser/OS language landed on the gate in Arabic even though
  // English is configured as the default. The gate is meant to open in
  // English by default, matching the client's rans.ca reference; people
  // can still reach Arabic explicitly via /ar or the locale switcher.
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
