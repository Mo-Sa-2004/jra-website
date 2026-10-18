import { getTranslations, setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { pageMetadata } from "@/lib/page-metadata";
import { StatGrid } from "@/components/stat-grid";
import { ORG } from "@/lib/organisation";
import { ui } from "@/lib/ui";

export const revalidate = 3600;

export const generateMetadata = pageMetadata("/industry-in-numbers", "industryNumbers");

/**
 * Every figure here is the same computed query the homepage and About page
 * already run (restaurant count, supplier count, governorates represented) —
 * reused rather than re-typed, so this page can't drift out of sync with the
 * numbers shown anywhere else on the site.
 */
export default async function IndustryInNumbersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("industryNumbers");

  const [restaurantCount, supplierCount, governorates] = await Promise.all([
    db.restaurant.count({ where: { status: "PUBLISHED" } }),
    db.supplier.count({ where: { status: "PUBLISHED" } }),
    db.restaurant.findMany({
      where: { status: "PUBLISHED", governorateId: { not: null } },
      distinct: ["governorateId"],
      select: { governorateId: true },
    }),
  ]);

  const stats = [
    { value: restaurantCount + supplierCount, label: t("statMembers"), suffix: "+" },
    { value: restaurantCount, label: t("statRestaurants") },
    { value: supplierCount, label: t("statSuppliers") },
    { value: governorates.length, label: t("statGovernorates") },
    { value: ORG.foundingYear, label: t("statFounded"), animate: false },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className={ui.pageTitle}>{t("title")}</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">{t("description")}</p>

      <StatGrid
        variant="card"
        className="mt-12 grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
        stats={stats}
      />
    </div>
  );
}
