import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];

if (!password || password.length < 10) {
  console.error(
    "Usage: node scripts/hash-admin-password.mjs <password of at least 10 characters>"
  );
  process.exit(1);
}

const salt = randomBytes(16);
const key = scryptSync(password, salt, 64, {
  N: 16384,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024,
});

console.log(
  `scrypt:16384:8:1:${salt.toString("hex")}:${key.toString("hex")}`
);
