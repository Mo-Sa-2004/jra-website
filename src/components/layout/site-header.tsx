"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Menu, X, ChevronDown, Phone, ExternalLink, ArrowLeft } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { primaryNav, foodieNav, businessNav, navRoutes, type NavCategory } from "@/lib/nav";
import { ORG } from "@/lib/organisation";
import { LocaleSwitcher } from "./locale-switcher";
import { HeaderSearch } from "./header-search";
import { PrimaryNav } from "./primary-nav";
import { AccountMenu } from "./account-menu";

/**
 * Mobile navigation: each category with children is its own accordion row,
 * tapped open rather than hovered — the client's rules call for hover/click
 * on desktop and tap on mobile, and an accordion is the tap equivalent of a
 * dropdown rather than a second, incompatible interaction.
 */
function MobileNav({
  categories = primaryNav,
  onNavigate,
}: {
  categories?: NavCategory[];
  onNavigate: () => void;
}) {
  const t = useTranslations();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <nav className="flex flex-col pt-2">
      {categories.map((cat) => {
        if (cat.children.length === 0) {
          return (
            <Link
              key={cat.labelKey}
              href={cat.href ?? "/"}
              onClick={onNavigate}
              className="rounded-md px-2 py-2.5 text-sm font-medium text-ink-soft hover:bg-surface-2 hover:text-ink"
            >
              {t(cat.labelKey)}
            </Link>
          );
        }

        const isOpen = expanded === cat.labelKey;
        return (
          <div key={cat.labelKey} className="border-b border-rule last:border-0">
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : cat.labelKey)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between rounded-md px-2 py-2.5 text-start text-sm font-medium text-ink-soft hover:bg-surface-2 hover:text-ink"
            >
              {t(cat.labelKey)}
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
            {isOpen ? (
              <div className="ps-4 pb-2">
                {cat.href ? (
                  <Link
                    href={cat.href}
                    onClick={onNavigate}
                    className="block rounded-md px-2 py-2 text-sm font-semibold text-accent"
                  >
                    {t(cat.labelKey)}
                  </Link>
                ) : null}
                {cat.children.map((child) => (
                  <Link
                    key={child.labelKey}
                    href={child.href}
                    onClick={onNavigate}
                    className="block rounded-md px-2 py-2 text-sm text-ink-soft hover:bg-surface-2 hover:text-ink"
                  >
                    {t(child.labelKey)}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

/**
 * Slim header for the three audience gates and everything each one leads
 * to — not just `/discover`/`/for-members`/`/jobs` themselves, but every
 * page their own nav links to (see `discoverRoutes`/`businessRoutes` and
 * `matchesRoute` below). Each gate is one audience's front door; the rest of
 * that audience's pages are its rooms, and a visitor who walks from one to
 * the other should never land back on the whole site's unsplit navigation —
 * that defeats the point of splitting the homepage by audience at all.
 *
 * Per the client's November 2026 content split, each side gets only the
 * categories that belong to it: `foodieNav` (Restaurants/Events/News/
 * Newsletter/Gallery) for Foodie, `businessNav` (About JRA/Membership/
 * Classification/Directory & Industry minus Restaurants/Training/Knowledge
 * Center) for Business — both defined once in lib/nav.ts, reusing the exact
 * same dropdown mechanics as the full site header (`PrimaryNav`/`MobileNav`,
 * just scoped to a shorter list). `/jobs` has no sub-content of its own
 * (SiyahaJobs is an external hand-off — see jobs/page.tsx), so it gets no
 * nav at all, just the brand and a way back.
 *
 * That "way back" is an explicit, always-visible button rather than relying
 * on the logo being clickable — the logo still links to "/" too, but a
 * labeled control is what the client asked for.
 *
 * `AccountMenu` rides along here too. It used to live only in the full,
 * un-split header below, which made sense back when every page shared one
 * header -- but once the gate split this slim header onto every page each
 * gate's nav links to (effectively the whole public site), that left no
 * reachable "Log In" anywhere: the full header only still renders on
 * orphaned utility pages (admin, portal, login, contact, legal) that
 * nothing links to either. Signed-out it's just the compact "Log In" pill,
 * so it sits comfortably next to the language switcher at every width this
 * header supports, mobile included -- no need for the separate `compact`
 * variant the full header's slide-down mobile panel uses.
 */
function GateSectionHeader({ audience }: { audience: "discover" | "forMembers" | "jobs" }) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  const categories: NavCategory[] =
    audience === "discover" ? foodieNav : audience === "forMembers" ? businessNav : [];

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6 md:px-8">
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/"
            aria-label={t("common.backHome")}
            className="ui-caps inline-flex items-center gap-1.5 rounded-full border border-rule px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-ink-faint hover:text-ink sm:px-3"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden="true" />
            <span className="hidden sm:inline">{t("common.backHome")}</span>
          </Link>
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src={ORG.brand.logo}
              alt={t("common.associationName")}
              width={162}
              height={31}
              priority
              className="h-7 w-auto sm:h-8"
            />
          </Link>
        </div>

        {categories.length > 0 ? <PrimaryNav categories={categories} /> : null}

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {audience === "forMembers" ? (
            <a
              href={ORG.external.crmLogin}
              target="_blank"
              rel="noopener noreferrer"
              className="ui-caps hidden items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink lg:inline-flex"
            >
              {t("header.memberPortal")}
              <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
            </a>
          ) : null}
          <LocaleSwitcher />
          <AccountMenu />
          {categories.length > 0 ? (
            <button
              type="button"
              className="inline-flex size-[40px] cursor-pointer items-center justify-center rounded-md text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent xl:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={t("common.toggleMenu")}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          ) : null}
        </div>
      </div>

      {open && categories.length > 0 ? (
        <div className="border-t border-rule bg-paper px-4 pb-4 xl:hidden">
          <MobileNav categories={categories} onNavigate={() => setOpen(false)} />
        </div>
      ) : null}
    </header>
  );
}

// Every page `foodieNav`/`businessNav` themselves link to (restaurant
// detail pages, article pages, etc. all nest under one of these prefixes).
// Computed once at module load, not per render — the category lists are
// static.
const discoverRoutes = navRoutes(foodieNav);
const businessRoutes = navRoutes(businessNav);

function matchesRoute(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function SiteHeader() {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /**
   * The client's navigation spec calls for a sticky header that compacts on
   * scroll ("ثابتاً Sticky مع بقاء ارتفاعه مضغوطاً أثناء التمرير") — a change
   * from this header's earlier fixed-height design, made deliberately then to
   * avoid reflow. Height now does change, but only the utility row's padding
   * and the logo's size, both transitioned, so the page settles into its new
   * layout smoothly rather than jumping.
   */
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > 80);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // The gate shows no header at all — it's nothing but the three tiles, per
  // the client's request.
  if (pathname === "/") return null;

  // Each gate's slim, audience-scoped header follows the visitor past the
  // gate itself and onto every page that gate's own nav links to — e.g.
  // clicking "Restaurant Directory" on the Foodie gate lands on
  // `/restaurants`, which must keep showing the Foodie header, not revert to
  // the full eight-category one. Without this, every click out of a gate
  // landed back on "the main [un-split] header," which is exactly the bug
  // this covers. Only pages no gate's nav links to (admin, portal, login,
  // legal/utility pages) still fall through to the full header below.
  if (pathname === "/jobs" || pathname.startsWith("/jobs/")) {
    return <GateSectionHeader audience="jobs" />;
  }
  if (pathname === "/discover" || matchesRoute(pathname, discoverRoutes)) {
    return <GateSectionHeader audience="discover" />;
  }
  if (pathname === "/for-members" || matchesRoute(pathname, businessRoutes)) {
    return <GateSectionHeader audience="forMembers" />;
  }

  return (
    <header
      data-scrolled={scrolled}
      className="site-header animate-nav-drop sticky top-0 z-40 bg-paper/85"
    >
      {/* Utility row — brand, contact/portal actions, account, language */}
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-[padding] duration-300 sm:px-6 md:px-8 ${
          scrolled ? "py-2" : "py-3.5"
        }`}
      >
        <Link href="/" className="flex shrink-0 items-center" onClick={() => setOpen(false)}>
          <Image
            src={ORG.brand.logo}
            alt={t("common.associationName")}
            width={162}
            height={31}
            priority
            className={`w-auto transition-[height] duration-300 ${scrolled ? "h-6 sm:h-7" : "h-7 sm:h-8"}`}
          />
        </Link>

        <div className="hidden shrink-0 items-center gap-1 xl:flex">
          <Link
            href="/contact"
            className="ui-caps rounded-md px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
          >
            {t("nav.contact")}
          </Link>
          <a
            href={ORG.external.crmLogin}
            target="_blank"
            rel="noopener noreferrer"
            className="ui-caps inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
          >
            {t("header.memberPortal")}
            <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
          </a>
          <div className="mx-1 h-5 w-px bg-rule" aria-hidden="true" />
          <LocaleSwitcher />
          <AccountMenu />
        </div>

        <div className="flex items-center gap-1 xl:hidden">
          <a
            href={ORG.phone.href}
            dir="ltr"
            aria-label={ORG.phone.display}
            className="hidden items-center justify-center rounded-full p-2.5 text-ink-soft hover:bg-surface-2 hover:text-ink sm:inline-flex"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
          </a>
          <HeaderSearch />
          <button
            className="inline-flex size-[44px] cursor-pointer items-center justify-center rounded-md text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            onClick={() => setOpen((v) => !v)}
            aria-label={t("common.toggleMenu")}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Centered primary navigation, plus Search and the Join JRA CTA so the
          most important action stays visible without opening the account
          menu. */}
      <div className="mx-auto hidden max-w-7xl items-center justify-center gap-6 px-4 pb-2 sm:px-6 md:px-8 xl:flex">
        <PrimaryNav />
        <div className="flex shrink-0 items-center gap-2">
          <HeaderSearch />
        </div>
      </div>

      {open && (
        <div className="border-t border-rule bg-paper px-4 pb-4 xl:hidden">
          <MobileNav onNavigate={() => setOpen(false)} />
          <div className="mt-2 flex flex-col gap-1 border-t border-rule pt-3">
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2.5 text-sm font-medium text-ink-soft hover:bg-surface-2 hover:text-ink"
            >
              {t("nav.contact")}
            </Link>
            <a
              href={ORG.external.crmLogin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md px-2 py-2.5 text-sm font-medium text-ink-soft hover:bg-surface-2 hover:text-ink"
            >
              {t("header.memberPortal")}
              <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
            </a>
          </div>
          <div className="mt-2 flex flex-col gap-2 border-t border-rule pt-3">
            <AccountMenu compact onNavigate={() => setOpen(false)} />
          </div>
          <div className="mt-3">
            <LocaleSwitcher />
          </div>
        </div>
      )}
    </header>
  );
}
