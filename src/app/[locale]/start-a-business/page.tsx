import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/page-metadata";
import { ComingSoon } from "@/components/coming-soon";

export const generateMetadata = pageMetadata("/start-a-business", "startBusiness", {
  noIndex: true,
});

export default async function StartABusinessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("directory");

  return <ComingSoon title={t("startBusinessTitle")} body={t("startBusinessBody")} />;
}
