import { NextResponse } from "next/server";

import {
  saveOrder,
  StorageNotConfiguredError,
} from "@/lib/admin/store";
import { calculateQuote, isRushTier } from "@/lib/pricing";

export const runtime = "nodejs";

const LANGUAGES = new Set(["zh", "en", "bilingual"]);
const DOCUMENT_TYPES = new Set(["essay", "thesis", "abstract", "other"]);
const REFERRALS = new Set([
  "instagram",
  "threads",
  "carousell",
  "referral",
  "search",
  "other",
]);

interface OrderRequest {
  name?: unknown;
  contact?: unknown;
  referral?: unknown;
  language?: unknown;
  documentType?: unknown;
  rush?: unknown;
  words?: unknown;
  deadline?: unknown;
  notes?: unknown;
  consent?: unknown;
}

function cleanString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

/**
 * Validates an order and, when ORDER_WEBHOOK_URL is configured, forwards it
 * to the owner's automation (Zapier, Make, or a custom endpoint). Without a
 * webhook the response is a handoff summary: the site never pretends an
 * order was delivered when there is nowhere to deliver it.
 */
export async function POST(request: Request) {
  let body: OrderRequest;

  try {
    body = (await request.json()) as OrderRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  const name = cleanString(body.name, 120);
  const contact = cleanString(body.contact, 240);
  const referral = cleanString(body.referral, 40);
  const language = cleanString(body.language, 20);
  const documentType = cleanString(body.documentType, 20);
  const rush =
    body.rush === undefined
      ? "standard"
      : isRushTier(body.rush)
        ? body.rush
        : null;
  const deadline = cleanString(body.deadline, 20);
  const notes = cleanString(body.notes, 4000);
  const words = Number(body.words);
  const consent = body.consent === true;

  if (
    !name ||
    (referral !== "" && !REFERRALS.has(referral)) ||
    !LANGUAGES.has(language) ||
    !DOCUMENT_TYPES.has(documentType) ||
    !Number.isFinite(words) ||
    words < 1 ||
    words > 100000 ||
    !rush ||
    !consent
  ) {
    return NextResponse.json(
      { ok: false, error: "invalid_order" },
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
  const orderId = `NAT-${new Date()
    .toISOString()
    .slice(2, 10)
    .replace(/-/g, "")}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;

  const order = {
    orderId,
    createdAt: new Date().toISOString(),
    name,
    contact,
    referral,
    language,
    documentType,
    words: quote.words,
    units: 0,
    baseAmount: quote.baseAmount,
    rushFee: quote.rushFee,
    rushTier: quote.rush,
    turnaroundMinutes: quote.rushMinutes,
    quote: quote.amount,
    currency: "HKD",
    deadline: deadline || null,
    notes,
    source: "naturalizer-site",
  };

  let stored = false;

  try {
    await saveOrder(order);
    stored = true;
  } catch (error) {
    if (!(error instanceof StorageNotConfiguredError)) {
      console.error("Order storage failed", error);
    }
  }

  const webhookUrl = process.env.ORDER_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      {
        ok: true,
        mode: stored ? "received" : "handoff",
        orderId,
        quote: quote.amount,
        baseAmount: quote.baseAmount,
        rushFee: quote.rushFee,
        rush: quote.rush,
        rushMinutes: quote.rushMinutes,
        words: quote.words,
        stored,
      },
      { status: stored ? 200 : 202 }
    );
  }

  try {
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(order),
      signal: AbortSignal.timeout(6000),
    });

    if (!webhookResponse.ok) {
      throw new Error(`Webhook responded with ${webhookResponse.status}`);
    }
  } catch (error) {
    console.error("Order webhook failed", error);

    if (!stored) {
      return NextResponse.json(
        { ok: false, error: "delivery_failed", orderId },
        { status: 502 }
      );
    }
  }

  return NextResponse.json({
    ok: true,
    mode: "received",
    orderId,
    quote: quote.amount,
    baseAmount: quote.baseAmount,
    rushFee: quote.rushFee,
    rush: quote.rush,
    rushMinutes: quote.rushMinutes,
    words: quote.words,
    stored,
  });
}
