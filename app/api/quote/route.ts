import { NextResponse } from "next/server";

import {
  saveQuote,
  StorageNotConfiguredError,
} from "@/lib/admin/store";
import {
  calculateQuote,
  isRushTier,
  type RushTier,
} from "@/lib/pricing";

export const runtime = "nodejs";

const LANGUAGES = new Set(["zh", "en", "bilingual"]);
const DOCUMENT_TYPES = new Set(["essay", "thesis", "abstract", "other"]);

interface QuoteRequest {
  words?: unknown;
  language?: unknown;
  documentType?: unknown;
  rush?: unknown;
}

/**
 * Creates a structured, shareable quote. The quote ID is returned to the
 * browser and can be copied into Carousell chat.
 *
 * If QUOTE_WEBHOOK_URL is configured, the quote is also sent to that
 * endpoint for server-side archiving. Vercel functions cannot persist
 * quotes locally, so no fake local database is used when it is absent.
 */
export async function POST(request: Request) {
  let body: QuoteRequest;

  try {
    body = (await request.json()) as QuoteRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  const words = Number(body.words);
  const language =
    typeof body.language === "string" ? body.language.trim() : "";
  const documentType =
    typeof body.documentType === "string" ? body.documentType.trim() : "";
  const rush: RushTier =
    body.rush === undefined
      ? "standard"
      : isRushTier(body.rush)
        ? body.rush
        : "standard";

  if (
    !Number.isFinite(words) ||
    words < 1 ||
    words > 100000 ||
    !LANGUAGES.has(language) ||
    !DOCUMENT_TYPES.has(documentType)
  ) {
    return NextResponse.json(
      { ok: false, error: "invalid_quote_request" },
      { status: 422 }
    );
  }

  const quote = calculateQuote(words, rush);

  if (!quote.rushEligible) {
    return NextResponse.json(
      { ok: false, error: "urgent_requires_manual_intake" },
      { status: 422 }
    );
  }
  const createdAt = new Date();
  const expiresAt = new Date(createdAt);
  expiresAt.setDate(expiresAt.getDate() + 14);

  const quoteId = `QTE-${createdAt
    .toISOString()
    .slice(2, 10)
    .replace(/-/g, "")}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;

  const record = {
    quoteId,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    language,
    documentType,
    pricing: {
      currency: "HKD",
      words: quote.words,
      baseAmount: quote.baseAmount,
      rush: quote.rush,
      rushMinutes: quote.rushMinutes,
      rushFee: quote.rushFee,
      rushEligible: quote.rushEligible,
      amount: quote.amount,
    },
    source: "naturalizer-site",
  };

  let stored = false;

  try {
    await saveQuote({
      quoteId,
      language,
      documentType,
      words: quote.words,
      units: 0,
      baseAmount: quote.baseAmount,
      rushFee: quote.rushFee,
      rushTier: quote.rush,
      turnaroundMinutes: quote.rushMinutes,
      amount: quote.amount,
      currency: "HKD",
      createdAt: record.createdAt,
      expiresAt: record.expiresAt,
    });
    stored = true;
  } catch (error) {
    if (!(error instanceof StorageNotConfiguredError)) {
      console.error("Quote storage failed", error);
    }
  }

  const webhookUrl = process.env.QUOTE_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json({ ok: true, stored, ...record });
  }

  try {
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event: "quote.created", ...record }),
      signal: AbortSignal.timeout(5000),
    });

    if (!webhookResponse.ok) {
      throw new Error(`Webhook responded with ${webhookResponse.status}`);
    }

    return NextResponse.json({ ok: true, stored: true, ...record });
  } catch (error) {
    console.error("Quote webhook failed", error);

    // The browser and, where configured, the database still keep the quote.
    return NextResponse.json({ ok: true, stored, ...record });
  }
}
