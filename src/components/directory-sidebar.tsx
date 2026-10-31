"use client";
import { cx, ui } from "@/lib/ui";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

type Governorate = { slug: string; nameEn: string; nameAr: string | null };
type Cuisine = { slug: string; nameEn: string; nameAr: string | null };

/**
 * The filter sidebar for `/restaurants`, matching the client's rans.ca
 * reference's own directory layout: a left-hand panel (name search, city,
 * cuisine checkboxes) next to the result grid, rather than the old
 * horizontal filter bar above it (`directory-filters.tsx`, this file's
 * predecessor). Renamed on top of the restructure since "sidebar" is what
 * it now is, not a "filters bar" anymore.
 *
 * Cuisine moved from a single-select dropdown to a checkbox list so more
 * than one can be picked at once, matching the reference — `cuisine` in the
 * URL is now a comma-joined list of slugs instead of one slug.
 */
export function DirectorySidebar({
  governorates,
  cuisines,
  current,
}: {
  governorates: Governorate[];
  cuisines: Cuisine[];
  current: { q?: string; governorate?: string; cuisine?: string };
}) {
  const tr = useTranslations("restaurants");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const selectedCuisines = new Set((current.cuisine ?? "").split(",").filter(Boolean));

  function push(params: URLSearchParams) {
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function updateOne(key: string, value: string) {
    const params = new URLSearchParams(current as Record<string, string>);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    push(params);
  }

  function toggleCuisine(slug: string) {
    const next = new Set(selectedCuisines);
    if (next.has(slug)) {
      next.delete(slug);
    } else {
      next.add(slug);
    }
    const params = new URLSearchParams(current as Record<string, string>);
    if (next.size > 0) {
      params.set("cuisine", [...next].join(","));
    } else {
      params.delete("cuisine");
    }
    push(params);
  }

  return (
    <aside className="flex flex-col gap-6">
      <div>
        <h2 className="ui-caps text-xs font-bold text-ink-soft">{tr("restaurantNameLabel")}</h2>
        <input
          type="search"
          defaultValue={current.q ?? ""}
          placeholder={tr("restaurantNameLabel")}
          onChange={(e) => {
            const value = e.currentTarget.value;
            clearTimeout((window as unknown as { __q?: ReturnType<typeof setTimeout> }).__q);
            (window as unknown as { __q?: ReturnType<typeof setTimeout> }).__q = setTimeout(
              () => updateOne("q", value),
              400
            );
          }}
          className={cx("mt-2 w-full", ui.fieldCompactOnPaper)}
        />
      </div>

      <div>
        <h2 className="ui-caps text-xs font-bold text-ink-soft">{tr("cityLabel")}</h2>
        <select
          defaultValue={current.governorate ?? ""}
          onChange={(e) => updateOne("governorate", e.target.value)}
          className={cx("mt-2 w-full", ui.fieldCompactOnPaper)}
        >
          <option value="">{tr("allGovernorates")}</option>
          {governorates.map((g) => (
            <option key={g.slug} value={g.slug}>
              {locale === "ar" && g.nameAr ? g.nameAr : g.nameEn}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h2 className="ui-caps text-xs font-bold text-ink-soft">{tr("typeOfCuisineLabel")}</h2>
        <ul className="mt-2 max-h-72 space-y-1.5 overflow-y-auto pe-1">
          {cuisines.map((c) => (
            <li key={c.slug}>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft hover:text-ink">
                <input
                  type="checkbox"
                  checked={selectedCuisines.has(c.slug)}
                  onChange={() => toggleCuisine(c.slug)}
                  className="h-4 w-4 shrink-0 rounded border-rule text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                />
                {locale === "ar" && c.nameAr ? c.nameAr : c.nameEn}
              </label>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
