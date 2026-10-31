"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Menu, X, ChevronDown, Phone, ExternalLink } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { primaryNav } from "@/lib/nav";
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
function MobileNav({ onNavigate }: { onNavigate: () => void }) {
  const t = useTranslations();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <nav className="flex flex-col pt-2">
      {primaryNav.map((cat) => {
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
 * Slim header for the two audience-gate destinations (`/discover`,
 * `/for-members`) — not the site's full eight-category mega-nav. Those
 * pages are each one specific audience's front door, reached by picking a
 * tile on the gate (`/`, which shows no header at all — see the branch
 * below); showing the whole site's navigation there, built for every
 * audience at once, undercuts the point of splitting the homepage by
 * audience in the first place. The three links on each side are the same
 * ones that tile links to on the gate itself (see `audience-gate.tsx`), so
 * the gate and this header agree on what "related to it" means per side.
 * The logo keeps linking to "/", same as everywhere else — that's the way
 * back to the gate, no separate button needed for it.
 */
function GateSectionHeader({ audience }: { audience: "discover" | "forMembers" }) {
  const t = useTranslations();

  const links =
    audience === "discover"
      ? [
          { label: t("nav.restaurants"), href: "/restaurants" },
          { label: t("nav.news"), href: "/news" },
          { label: t("home.siyahaJobs"), href: "/jobs" },
        ]
      : [
          { label: t("nav.membership"), href: "/membership" },
          { label: t("nav.suppliers"), href: "/suppliers" },
          { label: t("nav.training"), href: "/training" },
        ];

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6 md:px-8">
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

        <nav aria-label={t("common.primaryNav")} className="flex items-center gap-0.5 sm:gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="ui-caps rounded-md px-2 py-2 text-xs font-medium text-ink-soft transition-colors hover:text-ink sm:px-3.5 sm:text-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>

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
        </div>
      </div>
    </header>
  );
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

  // The gate shows no header at all — it's nothing but the two tiles, per
  // the client's request. Its two destinations get the slim audience-scoped
  // header above instead of the full site nav. Every other page keeps the
  // full header exactly as before.
  if (pathname === "/") return null;
  if (pathname === "/discover" || pathname.startsWith("/discover/")) {
    return <GateSectionHeader audience="discover" />;
  }
  if (pathname === "/for-members" || pathname.startsWith("/for-members/")) {
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
