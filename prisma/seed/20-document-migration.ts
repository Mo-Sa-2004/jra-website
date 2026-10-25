/**
 * One-off migration for the 4 documents that existed on jra.jo but were
 * missing from the new site: the association's current bylaw regulation
 * (which also means `/legal` currently renders nothing at all — the page
 * is live in the nav but LegalDocument has zero rows until this runs), plus
 * three member-facing guides (restaurant rules of thumb, first-time
 * licensing, and the 2026 renewal circular).
 *
 * The PDFs themselves were pulled from jra.jo's listing pages by the client
 * directly (the raw document URLs on the old site don't resolve to stable,
 * fetchable paths) and already live in this repo at:
 *   public/uploads/legal/jra-regulation-59-2025.pdf
 *   public/uploads/resources/guides/restaurant-rules-of-thumb.pdf
 *   public/uploads/resources/guides/first-time-licensing-procedure.pdf
 *   public/uploads/resources/guides/membership-renewal-2026-circular.pdf
 *
 * This script only writes the database rows that point at those files —
 * it does not copy or move anything. `fileUrl` is the only place the PDF's
 * actual legal/procedural text is represented: per the project's
 * data-honesty rule, nobody hand-transcribes a 20-page regulation into
 * `bodyHtml`, so these rows carry short factual descriptions only.
 *
 * Idempotent: every write is an upsert keyed on a fixed slug, so running
 * this twice (e.g. once in dev, once in prod) is safe.
 */
import { db } from "@/lib/db";

async function upsertLegalDocument() {
  const slug = "regulation-59-2025";
  // The 2026 renewal circular (migrated below as a Resource) refers to this
  // same regulation as "No. 46 of 2025", while the document itself is
  // numbered 59 of 2025. That mismatch is in the association's own source
  // material, not something introduced here — both numbers are preserved
  // as-is rather than reconciled.
  const topic =
    "نظام رقم (59) لسنة 2025 - نظام معدل لنظام جمعية المطاعم السياحية الأردنية";

  const doc = await db.legalDocument.upsert({
    where: { slug },
    update: {
      type: "REGULATION",
      topic,
      year: 2025,
      isCurrent: true,
    },
    create: {
      slug,
      type: "REGULATION",
      topic,
      year: 2025,
      isCurrent: true,
    },
  });

  const fileUrl = "/uploads/legal/jra-regulation-59-2025.pdf";
  const existingVersion = await db.legalDocumentVersion.findFirst({
    where: { legalDocumentId: doc.id, versionLabel: "1.0" },
  });
  if (existingVersion) {
    await db.legalDocumentVersion.update({
      where: { id: existingVersion.id },
      data: { fileUrl },
    });
  } else {
    await db.legalDocumentVersion.create({
      data: {
        legalDocumentId: doc.id,
        versionLabel: "1.0",
        publishedAt: new Date("2025-01-01"),
        fileUrl,
      },
    });
  }
  console.log(`✓ legal document: ${slug}`);
}

async function upsertGuideResource(opts: {
  slug: string;
  fileUrl: string;
  locale: "en" | "ar";
  title: string;
}) {
  const resource = await db.resource.upsert({
    where: { slug: opts.slug },
    update: { fileUrl: opts.fileUrl, status: "PUBLISHED" },
    create: {
      slug: opts.slug,
      type: "GUIDE",
      fileUrl: opts.fileUrl,
      status: "PUBLISHED",
    },
  });

  await db.resourceTranslation.upsert({
    where: { resourceId_locale: { resourceId: resource.id, locale: opts.locale } },
    update: { title: opts.title },
    create: { resourceId: resource.id, locale: opts.locale, title: opts.title },
  });
  console.log(`✓ resource: ${opts.slug}`);
}

async function main() {
  await upsertLegalDocument();

  await upsertGuideResource({
    slug: "guide-restaurant-rules-of-thumb",
    fileUrl: "/uploads/resources/guides/restaurant-rules-of-thumb.pdf",
    locale: "en",
    title:
      "Restaurant Rules of Thumb: How Does Your Operation Measure Up to Industry Averages & Standards?",
  });

  await upsertGuideResource({
    slug: "guide-first-time-licensing-procedure",
    fileUrl: "/uploads/resources/guides/first-time-licensing-procedure.pdf",
    locale: "ar",
    title: "إجراءات طلب تصنيف مطعم سياحي لأول مرة",
  });

  await upsertGuideResource({
    slug: "guide-membership-renewal-2026-circular",
    fileUrl: "/uploads/resources/guides/membership-renewal-2026-circular.pdf",
    locale: "ar",
    title: "تجديد الاشتراك في جمعية المطاعم السياحية الأردنية للعام 2026",
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
