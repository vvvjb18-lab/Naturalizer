import { randomInt } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomPart(length: number) {
  let value = "";
  for (let index = 0; index < length; index += 1) {
    value += ALPHABET[randomInt(ALPHABET.length)];
  }
  return value;
}

export function generateTrackingCode() {
  return `TRK-${randomPart(5)}-${randomPart(5)}`;
}

export function normalizeTrackingCode(value: string) {
  const cleaned = value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (cleaned.startsWith("TRK") && cleaned.length === 13) {
    return `TRK-${cleaned.slice(3, 8)}-${cleaned.slice(8)}`;
  }

  return cleaned;
}

export function isValidTrackingCode(value: string) {
  return /^TRK-[A-HJ-NP-Z2-9]{5}-[A-HJ-NP-Z2-9]{5}$/.test(value);
}
