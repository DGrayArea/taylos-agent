// src/lib/privacy.ts
// Feature 13: Data Encryption & Privacy — AES-256-GCM + PII masking
import crypto from "crypto";

const ENCRYPTION_KEY_HEX = process.env.ENCRYPTION_KEY ?? "";

function getKey(): Buffer {
  if (ENCRYPTION_KEY_HEX.length === 64) {
    return Buffer.from(ENCRYPTION_KEY_HEX, "hex");
  }
  // Derive a 32-byte key from whatever is set (fallback for dev)
  return crypto.createHash("sha256").update(ENCRYPTION_KEY_HEX || "dev-only-key-change-in-prod").digest();
}

/** AES-256-GCM encryption */
export function encryptField(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Pack as: iv(12) + tag(16) + ciphertext, base64 encoded
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

/** AES-256-GCM decryption */
export function decryptField(encoded: string): string {
  const key = getKey();
  const buf = Buffer.from(encoded, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ciphertext = buf.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(ciphertext) + decipher.final("utf8");
}

// ─── PII Masking ───────────────────────────────────────────────────────────────

type PiiReplacement = string | ((match: string) => string);

const PII_PATTERNS: [RegExp, PiiReplacement][] = [
  // Account numbers (8-16 digits)
  [/\b\d{8,16}\b/g, (m: string) => "*".repeat(m.length - 4) + m.slice(-4)],
  // Nigerian phone numbers
  [/\b(?:\+?234|0)[789]\d{9}\b/g, (m: string) => m.slice(0, 4) + "****" + m.slice(-3)],
  // Email addresses
  [/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (m: string) => {
    const [local, domain] = m.split("@");
    return local.slice(0, 2) + "***@" + domain;
  }],
  // BVN (11 digits, common Nigerian PII)
  [/\bBVN:?\s*\d{11}\b/gi, "BVN: ***********"],
  // NIN (11 digits)
  [/\bNIN:?\s*\d{11}\b/gi, "NIN: ***********"],
];

export function maskPII(text: string): string {
  let result = text;
  for (const [pattern, replacement] of PII_PATTERNS) {
    if (typeof replacement === "string") {
      result = result.replace(pattern, replacement);
    } else {
      result = result.replace(pattern, replacement);
    }
  }
  return result;
}

/** Redact sensitive fields from an analysis result for display */
export function redactForDisplay<T extends Record<string, unknown>>(obj: T): T {
  const str = JSON.stringify(obj);
  return JSON.parse(maskPII(str)) as T;
}
