const ITERATIONS = 120_000;
const KEY_LENGTH = 32;
const DIGEST = "SHA-256";

const encoder = new TextEncoder();

function bytesToBase64(bytes: Uint8Array): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let result = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i] ?? 0;
    const b = bytes[i + 1] ?? 0;
    const c = bytes[i + 2] ?? 0;
    const triple = (a << 16) | (b << 8) | c;
    result += alphabet[(triple >> 18) & 63];
    result += alphabet[(triple >> 12) & 63];
    result += i + 1 < bytes.length ? alphabet[(triple >> 6) & 63] : "=";
    result += i + 2 < bytes.length ? alphabet[triple & 63] : "=";
  }
  return result;
}

function base64ToBytes(base64: string): Uint8Array {
  const normalized = base64.replace(/\s+/g, "");
  if (normalized.length % 4 !== 0) {
    throw new Error("Invalid base64 input");
  }
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const outputLength = (normalized.length / 4) * 3
    - (normalized.endsWith("==") ? 2 : normalized.endsWith("=") ? 1 : 0);
  const output = new Uint8Array(outputLength);
  let outputIndex = 0;
  for (let i = 0; i < normalized.length; i += 4) {
    const c1 = alphabet.indexOf(normalized[i]);
    const c2 = alphabet.indexOf(normalized[i + 1]);
    const c3 = normalized[i + 2] === "=" ? 64 : alphabet.indexOf(normalized[i + 2]);
    const c4 = normalized[i + 3] === "=" ? 64 : alphabet.indexOf(normalized[i + 3]);
    if (c1 < 0 || c2 < 0 || c3 < 0 || c4 < 0) {
      throw new Error("Invalid base64 input");
    }
    const triple = (c1 << 18) | (c2 << 12) | ((c3 & 63) << 6) | (c4 & 63);
    if (outputIndex < outputLength) output[outputIndex++] = (triple >> 16) & 255;
    if (outputIndex < outputLength) output[outputIndex++] = (triple >> 8) & 255;
    if (outputIndex < outputLength) output[outputIndex++] = triple & 255;
  }
  return output;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<Uint8Array> {
  if (!crypto?.subtle) {
    throw new Error("Web Crypto API is not available");
  }
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: toArrayBuffer(salt),
      iterations: ITERATIONS,
      hash: DIGEST,
    },
    keyMaterial,
    KEY_LENGTH * 8,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derived = await deriveKey(password, salt);
  return `pbkdf2$${bytesToBase64(salt)}$${bytesToBase64(derived)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored.startsWith("pbkdf2$")) {
    return false;
  }
  const parts = stored.split("$");
  if (parts.length !== 3) {
    return false;
  }
  const [, saltEncoded, hashEncoded] = parts;
  const salt = base64ToBytes(saltEncoded);
  const derived = await deriveKey(password, salt);
  const expected = base64ToBytes(hashEncoded);
  return timingSafeEqual(expected, derived);
}
