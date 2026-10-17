import { Construction } from "lucide-react";
import { ui } from "@/lib/ui";

/**
 * Stands in for a page the client's new sitemap names but that has no real
 * content or data model behind it yet (Governance, Partnerships, Start Your
 * Business). The alternative — inventing a committee list or a partner roll
 * — would be exactly the kind of fabricated content this project has
 * consistently avoided elsewhere (no invented ratings, no stock "member"
 * photos). This says plainly that the section is still being built, in the
 * same visual language as the rest of the site, so a dropdown link lands
 * somewhere honest rather than a 404.
 */
export function ComingSoon({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Construction className="h-6 w-6" aria-hidden="true" />
      </span>
      <h1 className={`mt-6 ${ui.pageTitle}`}>{title}</h1>
      <p className="mt-4 leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}
