"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { primaryNav, type NavCategory } from "@/lib/nav";

/**
 * Desktop primary navigation: eight items, each a single-level dropdown, per
 * the client's October 2026 navigation handover. Replaces the previous flat
 * link list and its sliding underline indicator — that indicator assumed
 * every item was a single destination, which stopped being true the moment
 * "About JRA" became a category with eight children.
 *
 * Opens on hover or focus and stays open on click (so a touch-as-mouse
 * device, e.g. a touchscreen laptop, still works); closes on Escape, on
 * outside click, and when focus leaves the item. Only one dropdown is open
 * at a time.
 */
export function PrimaryNav() {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = useState<number | null>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive = (cat: NavCategory) => {
    const hrefs = [cat.href, ...cat.children.map((c) => c.href)].filter(Boolean) as string[];
    return hrefs.some((h) => {
      const path = h.split("#")[0];
      if (path === "/") return pathname === "/";
      return pathname === path || pathname.startsWith(`${path}/`);
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  // A short delay on leave rather than closing instantly — without it, the
  // small gap between the trigger and the panel below it closes the menu
  // before the pointer actually reaches a child link.
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(null), 150);
  };

  return (
    <nav aria-label={t("common.primaryNav")} className="hidden xl:block">
      <ul ref={navRef} className="flex items-center gap-1">
        {primaryNav.map((cat, i) => {
          const active = isActive(cat);
          const hasChildren = cat.children.length > 0;
          const expanded = open === i;

          if (!hasChildren) {
            return (
              <li key={cat.labelKey}>
                <Link
                  href={cat.href ?? "/"}
                  aria-current={active ? "page" : undefined}
                  className={`ui-caps block rounded-md px-3.5 py-2.5 text-sm transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    active ? "font-semibold text-accent" : "font-medium text-ink-soft hover:text-ink"
                  }`}
                >
                  {t(cat.labelKey)}
                </Link>
              </li>
            );
          }

          return (
            <li
              key={cat.labelKey}
              className="relative"
              onMouseEnter={() => {
                cancelClose();
                setOpen(i);
              }}
              onMouseLeave={scheduleClose}
            >
              <button
                type="button"
                aria-expanded={expanded}
                aria-haspopup="true"
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen((v) => (v === i ? null : i))}
                onFocus={() => setOpen(i)}
                className={`ui-caps flex cursor-pointer items-center gap-1 rounded-md px-3.5 py-2.5 text-sm transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  active || expanded
                    ? "font-semibold text-accent"
                    : "font-medium text-ink-soft hover:text-ink"
                }`}
              >
                {t(cat.labelKey)}
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {expanded ? (
                <div
                  role="menu"
                  className="animate-dropdown-in absolute start-0 top-full z-50 mt-1 min-w-56 rounded-xl border border-rule bg-surface p-2"
                >
                  {cat.href ? (
                    <Link
                      href={cat.href}
                      role="menuitem"
                      onClick={() => setOpen(null)}
                      className="block rounded-lg px-3 py-2 text-sm font-semibold text-accent hover:bg-surface-2"
                    >
                      {t(cat.labelKey)}
                    </Link>
                  ) : null}
                  {cat.children.map((child) => (
                    <Link
                      key={child.labelKey}
                      href={child.href}
                      role="menuitem"
                      onClick={() => setOpen(null)}
                      className="block rounded-lg px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
                    >
                      {t(child.labelKey)}
                    </Link>
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
