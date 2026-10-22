export function formatMoney(amount: number) {
  const hasCents = Math.round(amount * 100) % 100 !== 0;
  return `HK$${amount.toLocaleString("en-HK", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("zh-HK", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export const languageLabels: Record<string, string> = {
  zh: "中文",
  en: "English",
  bilingual: "中英雙語",
};

export const documentLabels: Record<string, string> = {
  essay: "Essay",
  thesis: "畢業論文／章節",
  abstract: "Abstract",
  other: "其他",
};

export const rushLabels: Record<string, string> = {
  standard: "標準",
  priority: "中急",
  urgent: "特急",
};

export const referralLabels: Record<string, string> = {
  instagram: "Instagram",
  threads: "Threads",
  carousell: "Carousell",
  referral: "朋友介紹",
  search: "搜尋引擎",
  other: "其他",
};

export function rushLabel(order: {
  rushTier: string;
  turnaroundMinutes: number;
}) {
  return `${rushLabels[order.rushTier] ?? order.rushTier} · ${order.turnaroundMinutes} 分鐘`;
}
