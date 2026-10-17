import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/page-metadata";
import { ui } from "@/lib/ui";

export const generateMetadata = pageMetadata("/accessibility", "accessibility", { noIndex: true });

export default async function AccessibilityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legalPages");

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className={ui.pageTitle}>{t("accessibilityTitle")}</h1>
      <p className="mt-6 leading-relaxed text-ink-soft">{t("contentPending")}</p>
    </div>
  );
}
