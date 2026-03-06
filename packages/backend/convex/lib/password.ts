import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

const ITERATIONS = 120_000;
const KEY_LENGTH = 32;
const DIGEST = "sha256";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("base64");
  const derived = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("base64");
  return `pbkdf2$${salt}$${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  if (!stored.startsWith("pbkdf2$")) {
    return false;
  }
  const parts = stored.split("$");
  if (parts.length !== 3) {
    return false;
  }
  const [, salt, hash] = parts;
  const derived = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("base64");
  const a = Buffer.from(hash, "base64");
  const b = Buffer.from(derived, "base64");
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}
