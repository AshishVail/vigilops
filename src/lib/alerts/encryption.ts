import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

function getKey() {
  const value = process.env.ALERT_TOKEN_ENCRYPTION_KEY;
  if (!value) throw new Error("ALERT_TOKEN_ENCRYPTION_KEY is not configured");
  if (!/^[a-fA-F0-9]{64}$/.test(value)) {
    throw new Error("ALERT_TOKEN_ENCRYPTION_KEY must be a 32-byte hex string");
  }
  return Buffer.from(value, "hex");
}

export function encryptSecret(value: string) {
  if (!value) throw new Error("Secret cannot be empty");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptSecret(value: string) {
  const parts = value.split(".");
  if (parts.length !== 3) throw new Error("Encrypted secret format is invalid");
  const [ivText, tagText, encryptedText] = parts;
  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivText, "base64url"));
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedText, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
