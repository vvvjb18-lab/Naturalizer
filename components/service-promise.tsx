"use client";

import { Clock3, MessageCircle, ShieldCheck } from "lucide-react";

import { useSite } from "@/components/providers";
import { SectionHeading } from "@/components/section-heading";
import { Card } from "@/components/ui/card";
import { WHATSAPP_URL } from "@/lib/site";

/**
 * The four service rules that bound the rush promise. They sit outside the
 * pricing table so the limits are visible before a customer chooses a tier.
 */
export function ServicePromise() {
  const { copy } = useSite();

  return (
    <section id="service-promise" className="border-b border-border/60">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28">
        <SectionHeading
          eyebrow={copy.servicePromise.eyebrow}
          title={copy.servicePromise.title}
          description={copy.servicePromise.description}
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {copy.servicePromise.rules.map((rule, index) => (
            <Card key={rule.title} className="p-6 shadow-none">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {index === 2 ? (
                    <ShieldCheck
                      className="h-4 w-4"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  ) : (
                    <Clock3
                      className="h-4 w-4"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    {rule.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {rule.body}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-5 sm:px-6">
            <h3 className="text-sm font-medium text-foreground">
              {copy.servicePromise.rushTitle}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {copy.servicePromise.rushDescription}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">
                    {copy.servicePromise.rushColumns.tier}
                  </th>
                  <th className="px-5 py-3 font-medium">
                    {copy.servicePromise.rushColumns.time}
                  </th>
                  <th className="px-5 py-3 font-medium">
                    {copy.servicePromise.rushColumns.fee}
                  </th>
                  <th className="px-5 py-3 font-medium">
                    {copy.servicePromise.rushColumns.note}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {copy.servicePromise.rushRows.map((row) => (
                  <tr key={row.tier}>
                    <td className="px-5 py-4 font-medium text-foreground">
                      {row.tier}
                    </td>
                    <td className="px-5 py-4 tabular-nums text-foreground">
                      {row.time}
                    </td>
                    <td className="px-5 py-4 tabular-nums text-foreground">
                      {row.fee}
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {row.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-border px-5 py-4 text-xs leading-relaxed text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>{copy.servicePromise.manualNote}</p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.common.whatsappShort}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
