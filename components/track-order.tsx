"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Check,
  Circle,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";

import { useSite } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PUBLIC_STAGES, type PublicStage } from "@/lib/orders/public-status";

interface TrackResult {
  ok: true;
  trackingCode: string;
  orderId: string;
  status: string;
  stage: PublicStage;
  words: number;
  rushTier: string;
  turnaroundMinutes: number;
  createdAt: string;
  updatedAt: string;
}

function formatDate(value: string, locale: "zh" | "en") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-HK" : "en-HK", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function TrackOrder({ initialCode = "" }: { initialCode?: string }) {
  const { copy, locale } = useSite();
  const [code, setCode] = useState(initialCode.toUpperCase());
  const [activeCode, setActiveCode] = useState(initialCode.trim().toUpperCase());
  const [result, setResult] = useState<TrackResult | null>(null);
  const [loading, setLoading] = useState(Boolean(initialCode));
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    if (!activeCode) return;

    let cancelled = false;

    async function load(showLoader: boolean) {
      if (showLoader) setLoading(true);

      try {
        const response = await fetch(
          `/api/track/${encodeURIComponent(activeCode)}`,
          { cache: "no-store" }
        );

        if (response.status === 404) {
          if (!cancelled) {
            setResult(null);
            setNotFound(true);
            setError(false);
          }
          return;
        }

        if (!response.ok) throw new Error("Tracking request failed");

        const data = (await response.json()) as TrackResult;
        if (!cancelled) {
          setResult(data);
          setNotFound(false);
          setError(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load(true);
    const timer = window.setInterval(() => void load(false), 10_000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [activeCode, requestKey]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = code.trim().toUpperCase();
    if (!next) return;

    setResult(null);
    setNotFound(false);
    setError(false);
    setActiveCode(next);
    setRequestKey((value) => value + 1);
  }

  const stageIndex =
    result && result.stage !== "cancelled"
      ? PUBLIC_STAGES.indexOf(result.stage)
      : -1;

  return (
    <section className="border-b border-border/60">
      <div className="mx-auto w-full max-w-3xl px-6 py-16 md:py-24">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {copy.track.eyebrow}
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold leading-[1.15] tracking-[-0.02em] text-foreground sm:text-4xl">
            {copy.track.title}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
            {copy.track.description}
          </p>
        </div>

        <Card className="mt-10 p-5 shadow-none sm:p-6">
          <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
            <div className="min-w-0 flex-1">
              <label
                htmlFor="tracking-code"
                className="text-sm font-medium text-foreground"
              >
                {copy.track.label}
              </label>
              <input
                id="tracking-code"
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder={copy.track.placeholder}
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                className="mt-2 flex h-11 w-full rounded-lg border border-input bg-background px-3 font-mono text-sm tracking-wide text-foreground shadow-sm placeholder:font-sans placeholder:tracking-normal placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <Button
              type="submit"
              className="h-11 shrink-0 self-end rounded-lg px-5"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              )}
              {loading ? copy.track.checking : copy.track.submit}
            </Button>
          </form>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            {copy.track.help}
          </p>
        </Card>

        {notFound ? (
          <Card className="mt-4 border-amber-300/50 bg-amber-50/60 p-5 shadow-none dark:border-amber-900/60 dark:bg-amber-950/20">
            <p className="text-sm font-semibold text-foreground">
              {copy.track.notFoundTitle}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {copy.track.notFoundBody}
            </p>
          </Card>
        ) : null}

        {error ? (
          <Card className="mt-4 border-destructive/30 bg-destructive/5 p-5 shadow-none">
            <p className="text-sm font-semibold text-foreground">
              {copy.track.errorTitle}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {copy.track.errorBody}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setRequestKey((value) => value + 1)}
            >
              {copy.track.retry}
            </Button>
          </Card>
        ) : null}

        {result ? (
          <Card className="mt-4 overflow-hidden p-0 shadow-none">
            <div className="border-b border-border bg-muted/30 px-5 py-5 sm:px-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] font-medium tracking-wide text-primary">
                    {result.trackingCode}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                    {result.stage === "cancelled"
                      ? copy.track.cancelled
                      : copy.track.stages[stageIndex]}
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[10px] text-muted-foreground">
                  <RefreshCw
                    className="h-3 w-3 animate-[spin_4s_linear_infinite]"
                    aria-hidden="true"
                  />
                  {copy.track.autoRefresh}
                </span>
              </div>
            </div>

            {result.stage === "cancelled" ? (
              <div className="flex items-center gap-3 px-5 py-8 text-sm text-muted-foreground sm:px-6">
                <XCircle
                  className="h-5 w-5 shrink-0 text-destructive"
                  aria-hidden="true"
                />
                {copy.track.cancelled}
              </div>
            ) : (
              <ol className="px-5 py-6 sm:px-6">
                {PUBLIC_STAGES.map((stage, index) => {
                  const complete = index < stageIndex;
                  const current = index === stageIndex;

                  return (
                    <li key={stage} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={[
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                            complete
                              ? "border-primary bg-primary text-primary-foreground"
                              : current
                                ? "border-primary bg-primary/10 text-primary ring-4 ring-primary/10"
                                : "border-border bg-background text-muted-foreground",
                          ].join(" ")}
                        >
                          {complete ? (
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <Circle
                              className={current ? "h-2.5 w-2.5 fill-current" : "h-2.5 w-2.5"}
                              aria-hidden="true"
                            />
                          )}
                        </span>
                        {index < PUBLIC_STAGES.length - 1 ? (
                          <span
                            className={[
                              "my-1 w-px flex-1",
                              index < stageIndex ? "bg-primary" : "bg-border",
                            ].join(" ")}
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1 pb-5 last:pb-0">
                        <p
                          className={[
                            "text-sm",
                            current
                              ? "font-semibold text-foreground"
                              : complete
                                ? "text-foreground"
                                : "text-muted-foreground",
                          ].join(" ")}
                        >
                          {copy.track.stages[index]}
                        </p>
                        {current ? (
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            {copy.track.lastUpdated}:{" "}
                            {formatDate(result.updatedAt, locale)}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            <dl className="grid gap-3 border-t border-border px-5 py-5 text-xs sm:grid-cols-3 sm:px-6">
              <div>
                <dt className="text-muted-foreground">{copy.track.orderId}</dt>
                <dd className="mt-1 font-mono text-foreground">
                  {result.orderId}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{copy.track.words}</dt>
                <dd className="mt-1 text-foreground">{result.words}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  {copy.track.turnaround}
                </dt>
                <dd className="mt-1 text-foreground">
                  {result.turnaroundMinutes} 分鐘
                </dd>
              </div>
            </dl>
          </Card>
        ) : null}
      </div>
    </section>
  );
}
