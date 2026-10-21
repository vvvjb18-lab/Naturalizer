import { NextResponse } from "next/server";

import { calculateQuote, PRICING } from "@/lib/pricing";

export const runtime = "nodejs";

const LANGUAGES = new Set(["zh", "en", "bilingual"]);
const DOCUMENT_TYPES = new Set(["essay", "thesis", "abstract", "other"]);

interface QuoteRequest {
  words?: unknown;
  language?: unknown;
  documentType?: unknown;
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

  const quote = calculateQuote(words);
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
      units: quote.units,
      wordsPerUnit: PRICING.wordsPerUnit,
      unitPrice: PRICING.pricePerUnit,
      minimumPrice: PRICING.minimumPrice,
      amount: quote.amount,
      minimumApplied: quote.minimumApplied,
    },
    source: "naturalizer-site",
  };

  const webhookUrl = process.env.QUOTE_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json({ ok: true, stored: false, ...record });
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

    // The browser can still keep and share the quote even if archiving fails.
    return NextResponse.json({ ok: true, stored: false, ...record });
  }
}
