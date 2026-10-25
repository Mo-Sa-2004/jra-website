"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { subscribeToNewsletter } from "@/lib/actions/newsletter";

export function NewsletterForm() {
  const t = useTranslations("home");
  const tf = useTranslations("newsletterForm");
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, { ok: false });

  if (state.ok) {
    return (
      <div className="mt-6 flex items-center justify-center gap-2 text-olive-soft">
        <Check className="h-5 w-5" />
        <span>{tf("subscribed")}</span>
      </div>
    );
  }

  // Coded strings from the action ("rate_limited" / "invalid-email"), not
  // free text, so they map to their own translated messages rather than
  // being shown as-is.
  const errorMessage =
    state.error === "rate_limited"
      ? tf("rateLimited")
      : state.error
        ? tf("invalidEmail")
        : null;

  return (
    <div className="mx-auto mt-6 max-w-md">
      <form action={formAction} className="flex gap-2">
        <input
          type="email"
          name="email"
          required
          placeholder={t("newsletterPlaceholder")}
          aria-invalid={errorMessage ? true : undefined}
          className="w-full rounded-full border border-paper/25 bg-paper/10 px-4 py-2.5 text-sm text-paper placeholder:text-paper/50 focus:border-brass focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-full bg-brass px-5 py-2.5 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {pending ? <Loader2 className="me-1.5 inline h-3.5 w-3.5 animate-spin align-[-2px]" aria-hidden="true" /> : null}
          {t("newsletterCta")}
        </button>
      </form>
      {errorMessage ? (
        <p role="alert" className="mt-2 flex items-center justify-center gap-1.5 text-xs text-brass">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
