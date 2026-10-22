/**
 * Published price rules:
 * - First 600 words: HK$85.
 * - Words 601–1,200: HK$0.08 each.
 * - Words 1,201–1,800: HK$0.07 each.
 * - Words 1,801 and above: HK$0.06 each (rate floor).
 *
 * Rush fees are added after the word-based price:
 * - Standard (90 minutes): +HK$0
 * - Priority (60 minutes): +HK$30
 * - Urgent (30 minutes): +HK$60, limited to 600 words or manual intake.
 */
export const RUSH_TIERS = ["standard", "priority", "urgent"] as const;

export type RushTier = (typeof RUSH_TIERS)[number];

export const PRICING = {
  basePrice: 85,
  includedWords: 600,
  tiers: [
    { upTo: 1200, rate: 0.08 },
    { upTo: 1800, rate: 0.07 },
    { upTo: null, rate: 0.06 },
  ],
  rush: {
    standard: { minutes: 90, fee: 0 },
    priority: { minutes: 60, fee: 30 },
    urgent: { minutes: 30, fee: 60 },
  },
  urgentMaxWords: 600,
} as const;

export interface Quote {
  words: number;
  baseAmount: number;
  rush: RushTier;
  rushMinutes: number;
  rushFee: number;
  rushEligible: boolean;
  amount: number;
}

export function isRushTier(value: unknown): value is RushTier {
  return (
    typeof value === "string" &&
    (RUSH_TIERS as readonly string[]).includes(value)
  );
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function calculateBaseAmount(words: number) {
  if (words < 1) return 0;
  if (words <= PRICING.includedWords) return PRICING.basePrice;

  let amount: number = PRICING.basePrice;
  let previousLimit: number = PRICING.includedWords;

  for (const tier of PRICING.tiers) {
    const upperLimit = tier.upTo ?? words;
    const segmentWords = Math.min(words, upperLimit) - previousLimit;

    if (segmentWords > 0) {
      amount += segmentWords * tier.rate;
    }

    if (words <= upperLimit) break;
    previousLimit = upperLimit;
  }

  return roundCurrency(amount);
}

export function calculateQuote(
  words: number,
  rush: RushTier = "standard"
): Quote {
  const safeWords = Number.isFinite(words) ? Math.max(0, Math.floor(words)) : 0;
  const baseAmount = calculateBaseAmount(safeWords);
  const rushConfig = PRICING.rush[rush];
  const rushEligible =
    safeWords > 0 && (rush !== "urgent" || safeWords <= PRICING.urgentMaxWords);
  const rushFee = rushEligible ? rushConfig.fee : 0;

  return {
    words: safeWords,
    baseAmount,
    rush,
    rushMinutes: rushConfig.minutes,
    rushFee,
    rushEligible,
    amount: roundCurrency(baseAmount + rushFee),
  };
}

export function formatHKD(amount: number, locale: "zh" | "en") {
  return new Intl.NumberFormat(locale === "zh" ? "zh-HK" : "en-HK", {
    style: "currency",
    currency: "HKD",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
