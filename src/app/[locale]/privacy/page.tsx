import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/page-metadata";
import { ui } from "@/lib/ui";

export const generateMetadata = pageMetadata("/privacy", "privacy", { noIndex: true });

/**
 * Privacy policy text is a legal document, not decorative copy — it has to
 * come from JRA (or their counsel), not be drafted here. This page exists so
 * the footer's "Privacy" link resolves to something real rather than a 404,
 * and says plainly that the real text is pending.
 */
export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legalPages");

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className={ui.pageTitle}>{t("privacyTitle")}</h1>
      <p className="mt-6 leading-relaxed text-ink-soft">{t("contentPending")}</p>
    </div>
  );
}
