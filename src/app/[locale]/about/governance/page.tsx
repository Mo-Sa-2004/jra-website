import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/page-metadata";
import { ComingSoon } from "@/components/coming-soon";

export const generateMetadata = pageMetadata("/about/governance", "governance", {
  noIndex: true,
});

export default async function GovernancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return <ComingSoon title={t("governanceTitle")} body={t("governanceBody")} />;
}
