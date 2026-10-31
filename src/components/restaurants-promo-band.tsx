import { getTranslations } from "next-intl/server";
import { NewsletterForm } from "@/components/newsletter-form";

/**
 * Sits between the search band and the filters/results on `/restaurants`,
 * in the same position as the reference directory's own promo strip. The
 * reference's version advertises a specific campaign (its own food &
 * drink newsletter) JRA doesn't have an equivalent of, so this reuses the
 * newsletter signup already built for the homepage instead of inventing
 * promotional copy — same mechanism (`subscribeToNewsletter`), same
 * "stay informed" message, just in the directory's blue instead of the
 * homepage's dark ink section.
 */
export async function RestaurantsPromoBand() {
  const t = await getTranslations("home");

  return (
    <section className="bg-accent">
      <div className="mx-auto max-w-6xl px-4 py-10 text-center sm:px-6">
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          {t("newsletterTitle")}
        </h2>
        <p className="mt-2 text-sm text-white/80">{t("newsletterSubtitle")}</p>
        <NewsletterForm tone="accent" />
      </div>
    </section>
  );
}
