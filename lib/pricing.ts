/**
 * Published price rules:
 * under 600 words = HK$65; otherwise HK$85 per 600-word unit.
 */
export const PRICING = {
  minimumPrice: 65,
  pricePerUnit: 85,
  wordsPerUnit: 600,
} as const;

export interface Quote {
  words: number;
  units: number;
  amount: number;
  minimumApplied: boolean;
}

export function calculateQuote(words: number): Quote {
  const safeWords = Number.isFinite(words) ? Math.max(0, Math.floor(words)) : 0;

  if (safeWords === 0) {
    return { words: 0, units: 0, amount: 0, minimumApplied: false };
  }

  if (safeWords < PRICING.wordsPerUnit) {
    return {
      words: safeWords,
      units: 1,
      amount: PRICING.minimumPrice,
      minimumApplied: true,
    };
  }

  const units = Math.ceil(safeWords / PRICING.wordsPerUnit);

  return {
    words: safeWords,
    units,
    amount: units * PRICING.pricePerUnit,
    minimumApplied: false,
  };
}

export function formatHKD(amount: number, locale: "zh" | "en") {
  const formatted = new Intl.NumberFormat(
    locale === "zh" ? "zh-HK" : "en-HK",
    { maximumFractionDigits: 0 }
  ).format(amount);

  return `HK$${formatted}`;
}
