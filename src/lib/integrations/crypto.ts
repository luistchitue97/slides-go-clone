import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/**
 * Symmetric encryption for integration secrets (e.g. HubSpot refresh tokens)
 * stored in the database. AES-256-GCM; the ciphertext blob is
 * base64(iv[12] || authTag[16] || ciphertext).
 *
 * Key comes from INTEGRATION_TOKEN_KEY — 32 bytes, provided as 64 hex chars or
 * base64. Generate one with `openssl rand -hex 32`.
 */

const IV_BYTES = 12;
const TAG_BYTES = 16;

let _key: Buffer | null = null;

function getKey(): Buffer {
  if (_key) return _key;
  const raw = process.env.INTEGRATION_TOKEN_KEY;
  if (!raw) {
    throw new Error(
      "INTEGRATION_TOKEN_KEY is not set. Generate one with `openssl rand -hex 32` and " +
        "add it to .env.local / Vercel. Required to store integration tokens.",
    );
  }
  // Accept hex (64 chars) or base64; both must decode to 32 bytes.
  const key = /^[0-9a-fA-F]{64}$/.test(raw)
    ? Buffer.from(raw, "hex")
    : Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error(
      `INTEGRATION_TOKEN_KEY must be 32 bytes (got ${key.length}). Use \`openssl rand -hex 32\`.`,
    );
  }
  _key = key;
  return key;
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]).toString("base64");
}

export function decryptSecret(blob: string): string {
  const buf = Buffer.from(blob, "base64");
  const iv = buf.subarray(0, IV_BYTES);
  const tag = buf.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const ct = buf.subarray(IV_BYTES + TAG_BYTES);
  const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}
