"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Copy,
  ExternalLink,
  Loader2,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

import { useSite } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  calculateQuote,
  formatHKD,
  RUSH_TIERS,
  type RushTier,
} from "@/lib/pricing";
import {
  CAROUSELL_LISTING_URL,
  CAROUSELL_SELLER_URL,
  SELLER_HANDLE,
  SITE_URL,
  WHATSAPP_URL,
} from "@/lib/site";

type LanguageValue = "zh" | "en" | "bilingual";
type DocumentValue = "essay" | "thesis" | "abstract" | "other";
type Status = "idle" | "loading" | "done";

const referralValues = [
  "instagram",
  "threads",
  "carousell",
  "referral",
  "search",
  "other",
] as const;

type ReferralValue = "" | (typeof referralValues)[number];

interface FormValues {
  name: string;
  referral: ReferralValue;
  language: LanguageValue;
  documentType: DocumentValue;
  rush: RushTier;
  words: string;
  deadline: string;
  notes: string;
  consent: boolean;
}

interface FormErrors {
  name?: string;
  words?: string;
  rush?: string;
  consent?: string;
  form?: string;
}

interface OrderResult {
  orderId: string;
  trackingCode: string;
  mode: "handoff" | "received";
  quote: number;
  baseAmount: number;
  rushFee: number;
  rush: RushTier;
  rushMinutes: number;
  words: number;
}

interface QuoteApiResponse {
  ok: boolean;
  stored: boolean;
  quoteId: string;
  expiresAt: string;
  pricing: {
    amount: number;
    baseAmount: number;
    rushFee: number;
    rush: RushTier;
    rushMinutes: number;
    rushEligible: boolean;
    words: number;
  };
}

type QuoteStatus = "idle" | "loading" | "done" | "error";

const languageValues: LanguageValue[] = ["zh", "en", "bilingual"];
const documentValues: DocumentValue[] = [
  "essay",
  "thesis",
  "abstract",
  "other",
];

const initialValues: FormValues = {
  name: "",
  referral: "",
  language: "bilingual",
  documentType: "essay",
  rush: "standard",
  words: "",
  deadline: "",
  notes: "",
  consent: false,
};

const inputClass =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-destructive";

const selectClass = `${inputClass} appearance-none pr-9`;

/**
 * The order intake. A local quote is calculated immediately, then the form
 * posts to /api/orders. The API forwards to ORDER_WEBHOOK_URL when present;
 * otherwise the success screen turns the submission into a Carousell handoff.
 */
export function OrderSection() {
  const { locale, copy } = useSite();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<OrderResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [serverQuote, setServerQuote] = useState<QuoteApiResponse | null>(null);
  const [quoteStatus, setQuoteStatus] = useState<QuoteStatus>("idle");
  const [quoteCopied, setQuoteCopied] = useState(false);

  const wordCount = Number.parseInt(values.words, 10);
  const quote = useMemo(
    () =>
      calculateQuote(
        Number.isFinite(wordCount) ? wordCount : 0,
        values.rush
      ),
    [wordCount, values.rush]
  );

  useEffect(() => {
    if (!Number.isFinite(wordCount) || wordCount < 1 || !quote.rushEligible) {
      setServerQuote(null);
      setQuoteStatus("idle");
      setQuoteCopied(false);
      return;
    }

    const controller = new AbortController();
    setServerQuote(null);
    setQuoteCopied(false);
    setQuoteStatus("loading");

    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/quote", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            words: wordCount,
            language: values.language,
            documentType: values.documentType,
            rush: values.rush,
          }),
          signal: controller.signal,
        });

        const data = (await response.json().catch(() => ({}))) as {
          ok?: boolean;
          stored?: boolean;
          quoteId?: string;
          expiresAt?: string;
          pricing?: QuoteApiResponse["pricing"];
        };

        if (!response.ok || !data.ok || !data.quoteId || !data.pricing) {
          throw new Error("Quote request failed");
        }

        const nextQuote: QuoteApiResponse = {
          ok: true,
          stored: Boolean(data.stored),
          quoteId: data.quoteId,
          expiresAt: data.expiresAt ?? "",
          pricing: data.pricing,
        };

        setServerQuote(nextQuote);
        setQuoteStatus("done");

        try {
          const key = "naturalizer-quotes";
          const previous = JSON.parse(window.localStorage.getItem(key) ?? "[]");
          const records = Array.isArray(previous) ? previous : [];
          window.localStorage.setItem(
            key,
            JSON.stringify([nextQuote, ...records].slice(0, 10))
          );
        } catch {
          // The quote remains usable even if browser storage is unavailable.
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setServerQuote(null);
        setQuoteStatus("error");
      }
    }, 450);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    wordCount,
    values.language,
    values.documentType,
    values.rush,
    quote.rushEligible,
  ]);

  const languageLabel =
    copy.order.fields.languageOptions[languageValues.indexOf(values.language)];
  const documentLabel =
    copy.order.fields.documentOptions[documentValues.indexOf(values.documentType)];
  const rushLabel =
    copy.order.fields.rushOptions[RUSH_TIERS.indexOf(values.rush)];
  const referralLabel = values.referral
    ? copy.order.fields.referralOptions[
        referralValues.indexOf(values.referral)
      ]
    : "";
  const isLoading = status === "loading";

  function updateValue<Key extends keyof FormValues>(
    key: Key,
    value: FormValues[Key]
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({
      ...current,
      [key]: undefined,
      ...(key === "words" || key === "rush" ? { rush: undefined } : {}),
      form: undefined,
    }));
  }

  function validate() {
    const nextErrors: FormErrors = {};

    if (!values.name.trim()) nextErrors.name = copy.order.errors.name;
    if (!Number.isFinite(wordCount) || wordCount < 1) {
      nextErrors.words = copy.order.errors.words;
    }
    if (values.rush === "urgent" && wordCount > 600) {
      nextErrors.rush = copy.order.errors.rush;
    }
    if (!values.consent) nextErrors.consent = copy.order.errors.consent;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function buildSummary(order: OrderResult) {
    return [
      `Naturalizer — ${order.orderId}`,
      `${copy.order.fields.name}: ${values.name.trim()}`,
      referralLabel
        ? `${copy.order.fields.referral}: ${referralLabel}`
        : null,
      `${copy.order.fields.language}: ${languageLabel}`,
      `${copy.order.fields.documentType}: ${documentLabel}`,
      `${copy.order.fields.words}: ${order.words}`,
      `${copy.order.fields.rush}: ${rushLabel}`,
      `${copy.order.quote.baseAmount}: ${formatHKD(
        order.baseAmount,
        locale
      )}`,
      order.rushFee > 0
        ? `${copy.order.quote.rushFee}: ${formatHKD(order.rushFee, locale)}`
        : null,
      `${copy.order.quote.total}: ${formatHKD(order.quote, locale)}`,
      `${copy.order.success.trackingCode}: ${order.trackingCode}`,
      `${copy.order.success.track}: ${SITE_URL}/track?code=${order.trackingCode}`,
      values.deadline
        ? `${copy.order.fields.deadline}: ${values.deadline}`
        : null,
      values.notes.trim()
        ? `${copy.order.fields.notes}: ${values.notes.trim()}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading || !validate()) return;

    setStatus("loading");
    setErrors({});

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          referral: values.referral,
          language: values.language,
          documentType: values.documentType,
          rush: values.rush,
          words: wordCount,
          deadline: values.deadline,
          notes: values.notes,
          consent: values.consent,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        mode?: "handoff" | "received";
        orderId?: string;
        trackingCode?: string;
        quote?: number;
        baseAmount?: number;
        rushFee?: number;
        rush?: RushTier;
        rushMinutes?: number;
        words?: number;
      };

      if (!response.ok || !data.ok || !data.orderId) {
        throw new Error("Order request failed");
      }

      setResult({
        orderId: data.orderId,
        trackingCode: data.trackingCode ?? "",
        mode: data.mode === "received" ? "received" : "handoff",
        quote: data.quote ?? quote.amount,
        baseAmount: data.baseAmount ?? quote.baseAmount,
        rushFee: data.rushFee ?? quote.rushFee,
        rush: data.rush ?? quote.rush,
        rushMinutes: data.rushMinutes ?? quote.rushMinutes,
        words: data.words ?? quote.words,
      });
      setStatus("done");
      setCopied(false);
    } catch {
      setStatus("idle");
      setErrors({ form: copy.order.errors.network });
    }
  }

  async function writeClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback for browsers without the async clipboard API.
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  }

  async function copySummary() {
    if (!result) return;
    const success = await writeClipboard(buildSummary(result));
    setCopied(success);
  }

  async function copyQuoteSummary() {
    if (quote.words < 1) return;

    const summary = [
      `Naturalizer — ${copy.order.quote.title}`,
      serverQuote
        ? `${copy.order.quote.id}: ${serverQuote.quoteId}`
        : null,
      `${copy.order.fields.language}: ${languageLabel}`,
      `${copy.order.fields.documentType}: ${documentLabel}`,
      `${copy.order.fields.words}: ${quote.words}`,
      `${copy.order.fields.rush}: ${rushLabel}`,
      `${copy.order.quote.baseAmount}: ${formatHKD(
        serverQuote?.pricing.baseAmount ?? quote.baseAmount,
        locale
      )}`,
      quote.rushFee > 0
        ? `${copy.order.quote.rushFee}: ${formatHKD(
            serverQuote?.pricing.rushFee ?? quote.rushFee,
            locale
          )}`
        : null,
      `${copy.order.quote.total}: ${formatHKD(
        serverQuote?.pricing.amount ?? quote.amount,
        locale
      )}`,
    ]
      .filter(Boolean)
      .join("\n");

    const success = await writeClipboard(summary);
    setQuoteCopied(success);
  }

  function resetOrder() {
    setValues(initialValues);
    setErrors({});
    setResult(null);
    setStatus("idle");
    setCopied(false);
    setServerQuote(null);
    setQuoteStatus("idle");
    setQuoteCopied(false);
  }

  return (
    <section id="order" className="border-b border-border/60">
      <div className="mx-auto grid w-full max-w-6xl items-start gap-12 px-6 py-20 md:py-28 lg:grid-cols-[0.82fr_1fr] lg:gap-16">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {copy.order.eyebrow}
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold leading-[1.15] tracking-[-0.02em] text-foreground sm:text-4xl">
            {copy.order.title}
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            {copy.order.description}
          </p>

          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            {copy.order.bullets.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-2xl border border-border bg-muted/40 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-primary ring-1 ring-border">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  {copy.order.carousellTitle}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {copy.order.carousellDescription}
                </p>
              </div>
            </div>

            <a
              href={CAROUSELL_LISTING_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
            >
              {copy.order.carousellCta}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>

            <div className="mt-4">
              <Button asChild size="sm" className="rounded-full">
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  {copy.common.whatsappShort}
                </a>
              </Button>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              {copy.footer.seller}:{" "}
              <a
                href={CAROUSELL_SELLER_URL}
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline decoration-border underline-offset-4 hover:text-primary"
              >
                {SELLER_HANDLE}
              </a>
            </p>
          </div>
        </div>

        <Card className="min-w-0 p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-7">
          {status === "done" && result ? (
            <div aria-live="polite" className="animate-in fade-in-0">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">
                    {copy.order.success.handoffTitle}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {copy.order.success.handoffText}
                  </p>
                </div>
              </div>

              <dl className="mt-7 divide-y divide-border rounded-xl border border-border bg-muted/30 px-4">
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-xs text-muted-foreground">
                    {copy.order.success.orderId}
                  </dt>
                  <dd className="font-mono text-xs font-medium text-foreground">
                    {result.orderId}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-xs text-muted-foreground">
                    {copy.order.success.trackingCode}
                  </dt>
                  <dd className="font-mono text-xs font-medium text-foreground">
                    {result.trackingCode || "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-xs text-muted-foreground">
                    {copy.order.success.words}
                  </dt>
                  <dd className="text-sm tabular-nums text-foreground">
                    {result.words}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-xs text-muted-foreground">
                    {copy.order.success.rush}
                  </dt>
                  <dd className="text-sm tabular-nums text-foreground">
                    {rushLabel}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-xs text-muted-foreground">
                    {copy.order.quote.baseAmount}
                  </dt>
                  <dd className="text-sm tabular-nums text-foreground">
                    {formatHKD(result.baseAmount, locale)}
                  </dd>
                </div>
                {result.rushFee > 0 ? (
                  <div className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-xs text-muted-foreground">
                      {copy.order.success.rushFee}
                    </dt>
                    <dd className="text-sm tabular-nums text-foreground">
                      {formatHKD(result.rushFee, locale)}
                    </dd>
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-xs text-muted-foreground">
                    {copy.order.success.quote}
                  </dt>
                  <dd className="text-lg font-semibold tabular-nums text-foreground">
                    {formatHKD(result.quote, locale)}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button asChild className="flex-1">
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => void copySummary()}
                  >
                    {copy.order.success.whatsapp}
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={copySummary}
                >
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied ? copy.order.success.copied : copy.order.success.copy}
                </Button>
              </div>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                <a
                  href={CAROUSELL_LISTING_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
                >
                  {copy.order.success.carousell}
                </a>
              </p>

              <div className="mt-5 rounded-xl border border-border bg-background p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
                  {copy.order.success.next}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {copy.order.success.nextText}
                </p>
                {result.trackingCode ? (
                  <Link
                    href={`/track?code=${result.trackingCode}`}
                    className="mt-3 inline-flex text-xs font-medium text-primary underline decoration-primary/30 underline-offset-4"
                  >
                    {copy.order.success.track}
                  </Link>
                ) : null}
              </div>

              <button
                type="button"
                onClick={resetOrder}
                className="mt-5 text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {copy.order.success.reset}
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">
                    {copy.order.formTitle}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {copy.order.formDescription}
                  </p>
                </div>
                <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:flex">
                  <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-6" noValidate>
                <fieldset
                  disabled={isLoading}
                  className="grid gap-5 sm:grid-cols-2"
                >
                  <div>
                    <label
                      htmlFor="order-name"
                      className="text-sm font-medium text-foreground"
                    >
                      {copy.order.fields.name}
                      <span className="ml-1 text-destructive">*</span>
                    </label>
                    <input
                      id="order-name"
                      value={values.name}
                      onChange={(event) =>
                        updateValue("name", event.target.value)
                      }
                      placeholder={copy.order.fields.namePlaceholder}
                      autoComplete="name"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "name-error" : undefined}
                      className={`${inputClass} mt-2`}
                    />
                    {errors.name ? (
                      <p
                        id="name-error"
                        className="mt-1.5 text-xs text-destructive"
                      >
                        {errors.name}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label
                      htmlFor="order-referral"
                      className="text-sm font-medium text-foreground"
                    >
                      {copy.order.fields.referral}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {copy.common.optional}
                      </span>
                    </label>
                    <div className="relative mt-2">
                      <select
                        id="order-referral"
                        value={values.referral}
                        onChange={(event) =>
                          updateValue(
                            "referral",
                            event.target.value as ReferralValue
                          )
                        }
                        aria-describedby="referral-description"
                        className={selectClass}
                      >
                        <option value="">
                          {copy.order.fields.referralPlaceholder}
                        </option>
                        {copy.order.fields.referralOptions.map(
                          (option, index) => (
                            <option
                              key={referralValues[index]}
                              value={referralValues[index]}
                            >
                              {option}
                            </option>
                          )
                        )}
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                    <p
                      id="referral-description"
                      className="mt-1.5 text-xs text-muted-foreground"
                    >
                      {copy.order.fields.referralHint}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="order-language"
                      className="text-sm font-medium text-foreground"
                    >
                      {copy.order.fields.language}
                    </label>
                    <div className="relative mt-2">
                      <select
                        id="order-language"
                        value={values.language}
                        onChange={(event) =>
                          updateValue(
                            "language",
                            event.target.value as LanguageValue
                          )
                        }
                        className={selectClass}
                      >
                        {copy.order.fields.languageOptions.map(
                          (option, index) => (
                            <option
                              key={languageValues[index]}
                              value={languageValues[index]}
                            >
                              {option}
                            </option>
                          )
                        )}
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="order-document"
                      className="text-sm font-medium text-foreground"
                    >
                      {copy.order.fields.documentType}
                    </label>
                    <div className="relative mt-2">
                      <select
                        id="order-document"
                        value={values.documentType}
                        onChange={(event) =>
                          updateValue(
                            "documentType",
                            event.target.value as DocumentValue
                          )
                        }
                        className={selectClass}
                      >
                        {copy.order.fields.documentOptions.map(
                          (option, index) => (
                            <option
                              key={documentValues[index]}
                              value={documentValues[index]}
                            >
                              {option}
                            </option>
                          )
                        )}
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="order-words"
                      className="text-sm font-medium text-foreground"
                    >
                      {copy.order.fields.words}
                      <span className="ml-1 text-destructive">*</span>
                    </label>
                    <input
                      id="order-words"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={100000}
                      value={values.words}
                      onChange={(event) =>
                        updateValue("words", event.target.value)
                      }
                      placeholder={copy.order.fields.wordsPlaceholder}
                      aria-invalid={Boolean(errors.words)}
                      aria-describedby={
                        errors.words ? "words-error" : "words-description"
                      }
                      className={`${inputClass} mt-2`}
                    />
                    {errors.words ? (
                      <p
                        id="words-error"
                        className="mt-1.5 text-xs text-destructive"
                      >
                        {errors.words}
                      </p>
                    ) : (
                      <p
                        id="words-description"
                        className="mt-1.5 text-xs text-muted-foreground"
                      >
                        {copy.order.fields.wordsHint}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="order-rush"
                      className="text-sm font-medium text-foreground"
                    >
                      {copy.order.fields.rush}
                    </label>
                    <div className="relative mt-2">
                      <select
                        id="order-rush"
                        value={values.rush}
                        onChange={(event) =>
                          updateValue("rush", event.target.value as RushTier)
                        }
                        aria-invalid={Boolean(errors.rush)}
                        aria-describedby={
                          errors.rush ? "rush-error" : "rush-description"
                        }
                        className={selectClass}
                      >
                        {copy.order.fields.rushOptions.map((option, index) => (
                          <option key={RUSH_TIERS[index]} value={RUSH_TIERS[index]}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                    {errors.rush ? (
                      <p
                        id="rush-error"
                        className="mt-1.5 text-xs text-destructive"
                      >
                        {errors.rush}
                      </p>
                    ) : quote.words > 0 && !quote.rushEligible ? (
                      <p
                        id="rush-description"
                        className="mt-1.5 text-xs leading-relaxed text-destructive"
                      >
                        {copy.order.quote.urgentBlocked}
                      </p>
                    ) : (
                      <p
                        id="rush-description"
                        className="mt-1.5 text-xs leading-relaxed text-muted-foreground"
                      >
                        {copy.order.fields.rushHint}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="order-deadline"
                      className="text-sm font-medium text-foreground"
                    >
                      {copy.order.fields.deadline}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {copy.common.optional}
                      </span>
                    </label>
                    <input
                      id="order-deadline"
                      type="date"
                      value={values.deadline}
                      onChange={(event) =>
                        updateValue("deadline", event.target.value)
                      }
                      className={`${inputClass} mt-2`}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="order-notes"
                      className="text-sm font-medium text-foreground"
                    >
                      {copy.order.fields.notes}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {copy.common.optional}
                      </span>
                    </label>
                    <textarea
                      id="order-notes"
                      value={values.notes}
                      onChange={(event) =>
                        updateValue("notes", event.target.value)
                      }
                      placeholder={copy.order.fields.notesPlaceholder}
                      rows={3}
                      className="mt-2 flex min-h-[96px] w-full resize-y rounded-lg border border-input bg-background px-3 py-3 text-sm leading-relaxed text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:col-span-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {copy.order.quote.title}
                        </p>
                        <p
                          className="mt-1 text-xs leading-relaxed text-muted-foreground"
                          aria-live="polite"
                        >
                          {quote.words > 0
                            ? `${quote.words.toLocaleString(
                                locale === "zh" ? "zh-HK" : "en-HK"
                              )} ${copy.order.quote.wordSuffix} · ${rushLabel}`
                            : copy.order.quote.empty}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-muted-foreground">
                          {copy.order.quote.total}
                        </p>
                        <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                          {quote.words > 0
                            ? formatHKD(quote.amount, locale)
                            : "—"}
                        </p>
                      </div>
                    </div>

                    {quote.words > 0 ? (
                      <div className="mt-3 space-y-1 border-t border-primary/15 pt-3 text-[11px] text-muted-foreground">
                        <div className="flex items-center justify-between gap-4">
                          <span>{copy.order.quote.baseAmount}</span>
                          <span className="tabular-nums text-foreground">
                            {formatHKD(quote.baseAmount, locale)}
                          </span>
                        </div>
                        {quote.rushFee > 0 ? (
                          <div className="flex items-center justify-between gap-4">
                            <span>{copy.order.quote.rushFee}</span>
                            <span className="tabular-nums text-foreground">
                              {formatHKD(quote.rushFee, locale)}
                            </span>
                          </div>
                        ) : null}
                        <div className="flex items-center justify-between gap-4 pt-1 text-[11px]">
                          <span>{copy.order.quote.total}</span>
                          <span className="font-semibold tabular-nums text-foreground">
                            {formatHKD(quote.amount, locale)}
                          </span>
                        </div>
                      </div>
                    ) : null}

                    {quote.words > 0 && !quote.rushEligible ? (
                      <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-[11px] leading-relaxed text-destructive">
                        {copy.order.quote.urgentBlocked}
                      </p>
                    ) : null}

                    <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                      {copy.order.quote.note}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-primary/15 pt-3">
                      <p
                        className="text-[11px] text-muted-foreground"
                        aria-live="polite"
                        title={copy.order.quote.saveNote}
                      >
                        {serverQuote
                          ? `${copy.order.quote.id}: ${serverQuote.quoteId}`
                          : quoteStatus === "loading"
                            ? copy.order.quote.saving
                            : quoteStatus === "error"
                              ? copy.order.quote.saveError
                              : null}
                      </p>

                      {quote.words > 0 ? (
                        <button
                          type="button"
                          onClick={copyQuoteSummary}
                          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          {quoteCopied ? (
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          {quoteCopied
                            ? copy.order.quote.copied
                            : copy.order.quote.copy}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="order-consent"
                      className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-muted-foreground"
                    >
                      <input
                        id="order-consent"
                        type="checkbox"
                        checked={values.consent}
                        onChange={(event) =>
                          updateValue("consent", event.target.checked)
                        }
                        aria-invalid={Boolean(errors.consent)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                      />
                      <span>{copy.order.fields.consent}</span>
                    </label>
                    {errors.consent ? (
                      <p className="mt-1.5 text-xs text-destructive">
                        {errors.consent}
                      </p>
                    ) : null}
                    <p className="mt-2 pl-7 text-xs leading-relaxed text-muted-foreground">
                      {copy.order.fields.legalPrefix}{" "}
                      <Link
                        href="/terms"
                        className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
                      >
                        {copy.order.fields.termsLink}
                      </Link>{" "}
                      {copy.order.fields.and}{" "}
                      <Link
                        href="/privacy"
                        className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
                      >
                        {copy.order.fields.privacyLink}
                      </Link>
                    </p>
                  </div>

                  {errors.form ? (
                    <p
                      role="alert"
                      className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive sm:col-span-2"
                    >
                      {errors.form}
                    </p>
                  ) : null}

                  <div className="sm:col-span-2">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full rounded-lg"
                      disabled={
                        isLoading || (quote.words > 0 && !quote.rushEligible)
                      }
                    >
                      {isLoading ? (
                        <>
                          <Loader2
                            className="h-4 w-4 animate-spin"
                            aria-hidden="true"
                          />
                          {copy.order.submitting}
                        </>
                      ) : (
                        <>
                          <ShieldCheck
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                          {copy.order.submit}
                          {quote.words > 0
                            ? ` · ${formatHKD(quote.amount, locale)}`
                            : ""}
                        </>
                      )}
                    </Button>
                  </div>
                </fieldset>
              </form>
            </>
          )}
        </Card>
      </div>
    </section>
  );
}
