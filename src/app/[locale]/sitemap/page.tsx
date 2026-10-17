import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { footerSitemap } from "@/lib/nav";
import { pageMetadata } from "@/lib/page-metadata";
import { ui } from "@/lib/ui";

export const generateMetadata = pageMetadata("/sitemap", "sitemap");

/**
 * The human-readable sitemap the footer promises — distinct from
 * src/app/sitemap.ts, which is the machine-readable sitemap.xml for search
 * engines. Built from the same `footerSitemap` list the footer's own links
 * use, so this page can never drift out of sync with the real navigation.
 */
export default async function SitemapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const tl = await getTranslations("legalPages");

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className={ui.pageTitle}>{tl("sitemapTitle")}</h1>
      <ul className="mt-10 grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {footerSitemap.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="text-sm text-ink-soft transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {t(item.labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
