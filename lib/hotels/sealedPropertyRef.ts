/**
 * Sealed hotel property references (Sprint 17.5.1).
 *
 * Uses Node.js AES-256-GCM (authenticated encryption): confidentiality + integrity.
 * The browser may carry the opaque sealed string; it cannot recover the provider token.
 *
 * Wire format: `gpref1.` + base64url(iv || ciphertext || authTag)
 */

import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import type { HotelPropertyLookup } from "@/lib/hotels/propertyTokenRegistry";

/** Prefix distinguishing sealed refs from legacy irreversible `gpref-` hashes. */
export const SEALED_PROPERTY_REF_PREFIX = "gpref1.";

/** Payload schema version. */
export const SEALED_PROPERTY_REF_VERSION = 1;

/** Supported provider id inside the sealed payload. */
export const SEALED_PROPERTY_PROVIDER_SERPAPI = "serpapi";

/** Default lifetime — matches former in-process registry TTL (45 min). */
export const SEALED_PROPERTY_REF_TTL_MS = 45 * 60_000;

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const SCRYPT_SALT = "glooconn-property-ref-v1";

export type SealedPropertyRefPayload = {
  /** Schema version. */
  v: typeof SEALED_PROPERTY_REF_VERSION;
  /** Provider identifier (must be serpapi today). */
  p: typeof SEALED_PROPERTY_PROVIDER_SERPAPI;
  /** Raw SerpAPI property_token — never leave ciphertext. */
  t: string;
  /** Google Hotels `q` search query. */
  q: string;
  /** Check-in YYYY-MM-DD. */
  ci?: string;
  /** Check-out YYYY-MM-DD. */
  co?: string;
  /** ISO currency. */
  c?: string;
  /** Adults. */
  a?: number;
  /** Expiry as Unix epoch milliseconds. */
  exp: number;
  /** Glooconn hotel id binding. */
  hid: string;
};

export type SealHotelPropertyRefInput = {
  hotelId: string;
  propertyToken: string;
  query: string;
  checkInDate?: string;
  checkOutDate?: string;
  currency?: string;
  adults?: number;
  /** Override TTL (tests). */
  ttlMs?: number;
  /** Override now (tests). */
  nowMs?: number;
};

export type UnsealHotelPropertyRefResult = {
  lookup: HotelPropertyLookup;
  hotelId: string;
  provider: typeof SEALED_PROPERTY_PROVIDER_SERPAPI;
  expiresAtMs: number;
};

export class SealedPropertyRefError extends Error {
  readonly code:
    | "MISSING_SECRET"
    | "MALFORMED"
    | "TAMPERED"
    | "EXPIRED"
    | "WRONG_PROVIDER"
    | "INVALID_PAYLOAD";

  constructor(
    code: SealedPropertyRefError["code"],
    message = "Invalid property reference.",
  ) {
    super(message);
    this.name = "SealedPropertyRefError";
    this.code = code;
  }
}

function toBase64Url(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string): Buffer {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  return Buffer.from(padded + "=".repeat(padLength), "base64");
}

/**
 * Derives a 32-byte AES key from the configured seal secret.
 * Accepts 64-char hex as a raw key; otherwise scrypt with a fixed app salt.
 */
export function derivePropertyRefSealKey(secret: string): Buffer {
  const trimmed = secret.trim();
  if (!trimmed) {
    throw new SealedPropertyRefError(
      "MISSING_SECRET",
      "Property reference sealing is not configured.",
    );
  }

  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, "hex");
  }

  if (trimmed.length < 32) {
    throw new SealedPropertyRefError(
      "MISSING_SECRET",
      "PROPERTY_REF_SEAL_SECRET must be at least 32 characters (or 64 hex chars).",
    );
  }

  return scryptSync(trimmed, SCRYPT_SALT, KEY_LENGTH);
}

export function isSealedPropertyRef(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith(SEALED_PROPERTY_REF_PREFIX);
}

/**
 * Seals provider context into an opaque browser-safe reference.
 */
export function sealHotelPropertyRef(
  input: SealHotelPropertyRefInput,
  secret: string,
): string {
  const hotelId = input.hotelId.trim();
  const propertyToken = input.propertyToken.trim();
  const query = input.query.trim();
  if (!hotelId || !propertyToken || !query) {
    throw new SealedPropertyRefError(
      "INVALID_PAYLOAD",
      "Cannot seal an incomplete property reference.",
    );
  }

  const nowMs = input.nowMs ?? Date.now();
  const ttlMs =
    typeof input.ttlMs === "number" &&
    Number.isFinite(input.ttlMs) &&
    input.ttlMs > 0
      ? Math.floor(input.ttlMs)
      : SEALED_PROPERTY_REF_TTL_MS;

  const payload: SealedPropertyRefPayload = {
    v: SEALED_PROPERTY_REF_VERSION,
    p: SEALED_PROPERTY_PROVIDER_SERPAPI,
    t: propertyToken,
    q: query,
    exp: nowMs + ttlMs,
    hid: hotelId,
  };

  if (input.checkInDate?.trim()) {
    payload.ci = input.checkInDate.trim();
  }
  if (input.checkOutDate?.trim()) {
    payload.co = input.checkOutDate.trim();
  }
  if (input.currency?.trim()) {
    payload.c = input.currency.trim();
  }
  if (
    typeof input.adults === "number" &&
    Number.isFinite(input.adults) &&
    input.adults >= 1
  ) {
    payload.a = Math.floor(input.adults);
  }

  const key = derivePropertyRefSealKey(secret);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const packed = Buffer.concat([iv, encrypted, authTag]);

  return `${SEALED_PROPERTY_REF_PREFIX}${toBase64Url(packed)}`;
}

/**
 * Verifies and decrypts a sealed reference.
 * Throws SealedPropertyRefError on any failure — never returns partial secrets.
 */
export function unsealHotelPropertyRef(
  sealedRef: string,
  secret: string,
  options: { nowMs?: number; expectedHotelId?: string } = {},
): UnsealHotelPropertyRefResult {
  const trimmed = sealedRef?.trim() ?? "";
  if (!isSealedPropertyRef(trimmed)) {
    throw new SealedPropertyRefError("MALFORMED");
  }

  let key: Buffer;
  try {
    key = derivePropertyRefSealKey(secret);
  } catch (error) {
    if (error instanceof SealedPropertyRefError) {
      throw error;
    }
    throw new SealedPropertyRefError("MISSING_SECRET");
  }

  const encoded = trimmed.slice(SEALED_PROPERTY_REF_PREFIX.length);
  let packed: Buffer;
  try {
    packed = fromBase64Url(encoded);
  } catch {
    throw new SealedPropertyRefError("MALFORMED");
  }

  if (packed.length <= IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new SealedPropertyRefError("MALFORMED");
  }

  const iv = packed.subarray(0, IV_LENGTH);
  const authTag = packed.subarray(packed.length - AUTH_TAG_LENGTH);
  const ciphertext = packed.subarray(IV_LENGTH, packed.length - AUTH_TAG_LENGTH);

  let plaintext: Buffer;
  try {
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch {
    throw new SealedPropertyRefError("TAMPERED");
  }

  let payload: SealedPropertyRefPayload;
  try {
    payload = JSON.parse(plaintext.toString("utf8")) as SealedPropertyRefPayload;
  } catch {
    throw new SealedPropertyRefError("INVALID_PAYLOAD");
  }

  if (
    payload?.v !== SEALED_PROPERTY_REF_VERSION ||
    typeof payload.t !== "string" ||
    typeof payload.q !== "string" ||
    typeof payload.hid !== "string" ||
    typeof payload.exp !== "number"
  ) {
    throw new SealedPropertyRefError("INVALID_PAYLOAD");
  }

  if (payload.p !== SEALED_PROPERTY_PROVIDER_SERPAPI) {
    throw new SealedPropertyRefError("WRONG_PROVIDER");
  }

  const nowMs = options.nowMs ?? Date.now();
  if (!Number.isFinite(payload.exp) || nowMs >= payload.exp) {
    throw new SealedPropertyRefError("EXPIRED");
  }

  const hotelId = payload.hid.trim();
  const propertyToken = payload.t.trim();
  const query = payload.q.trim();
  if (!hotelId || !propertyToken || !query) {
    throw new SealedPropertyRefError("INVALID_PAYLOAD");
  }

  if (options.expectedHotelId?.trim()) {
    const expected = Buffer.from(options.expectedHotelId.trim());
    const actual = Buffer.from(hotelId);
    if (
      expected.length !== actual.length ||
      !timingSafeEqual(expected, actual)
    ) {
      throw new SealedPropertyRefError("TAMPERED");
    }
  }

  const lookup: HotelPropertyLookup = {
    propertyToken,
    query,
  };
  if (payload.ci?.trim()) {
    lookup.checkInDate = payload.ci.trim();
  }
  if (payload.co?.trim()) {
    lookup.checkOutDate = payload.co.trim();
  }
  if (payload.c?.trim()) {
    lookup.currency = payload.c.trim();
  }
  if (
    typeof payload.a === "number" &&
    Number.isFinite(payload.a) &&
    payload.a >= 1
  ) {
    lookup.adults = Math.floor(payload.a);
  }

  return {
    lookup,
    hotelId,
    provider: SEALED_PROPERTY_PROVIDER_SERPAPI,
    expiresAtMs: payload.exp,
  };
}
