import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { pageMetadata } from "@/lib/page-metadata";
import { ui } from "@/lib/ui";

export const revalidate = 900;

export const generateMetadata = pageMetadata("/gallery", "gallery");

/**
 * `MediaGalleryItem` already carries photos attached to news articles (via
 * the admin's news-gallery upload, wired up separately) and, once events
 * exist, to events too. This page is just the first public read of that
 * table — a flat, newest-first grid, since nothing about the data suggests a
 * grouping yet.
 */
export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("gallery");
  const tCommon = await getTranslations("common");

  const items = await db.mediaGalleryItem.findMany({
    orderBy: { id: "desc" },
    take: 60,
    include: {
      event: { include: { translations: { where: { locale: locale === "ar" ? "ar" : "en" } } } },
      newsArticle: {
        include: { translations: { where: { locale: locale === "ar" ? "ar" : "en" } } },
      },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className={ui.pageTitle}>{t("title")}</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">{t("description")}</p>

      {items.length === 0 ? (
        <p className="mt-12 text-center text-ink-soft">{tCommon("noResults")}</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            const source = item.event?.translations[0]?.title ?? item.newsArticle?.translations[0]?.title;
            const alt = item.caption ?? source ?? "";
            return (
              <div
                key={item.id}
                className="group relative aspect-square overflow-hidden rounded-xl border border-rule bg-surface-2"
              >
                <Image
                  src={item.imageUrl}
                  alt={alt}
                  fill
                  sizes="(min-width: 1024px) 23vw, (min-width: 640px) 31vw, 47vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {item.caption ? (
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {item.caption}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
