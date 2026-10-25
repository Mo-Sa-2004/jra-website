import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

/**
 * The audience-gate's only action: set which side the visitor picked, then
 * send them to that side's homepage. A plain GET (the tiles on
 * `[locale]/page.tsx` just link here with `?to=diner|member`) rather than a
 * form/server action, since there's no data to submit and this needs to work
 * as an ordinary link.
 *
 * The cookie is read back by `middleware.ts`, which skips the gate entirely
 * for a returning visitor and sends them straight to their side.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale = (routing.locales as readonly string[]).includes(locale)
    ? locale
    : routing.defaultLocale;

  const to = request.nextUrl.searchParams.get("to") === "member" ? "member" : "diner";
  const target = to === "member" ? "for-members" : "discover";

  const response = NextResponse.redirect(new URL(`/${resolvedLocale}/${target}`, request.url));
  response.cookies.set("jra_audience", to, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}
