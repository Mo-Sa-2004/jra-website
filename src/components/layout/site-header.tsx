"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Menu, X, ChevronDown, Phone, ExternalLink } from "lucide-react";
import { Link } from "@/i18n/navigation";
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

export function SiteHeader() {
  const t = useTranslations();
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
