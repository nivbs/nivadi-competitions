function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(encoded: string): Uint8Array | null {
  try {
    const pad = encoded.length % 4 === 0 ? "" : "=".repeat(4 - (encoded.length % 4));
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/") + pad;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

function base64UrlDecodeToString(encoded: string): string | null {
  const bytes = base64UrlDecode(encoded);
  if (!bytes) {
    return null;
  }
  return new TextDecoder().decode(bytes);
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signPayload(secret: string, payload: string): Promise<string> {
  const key = await importHmacKey(secret);
  const enc = new TextEncoder();
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const payloadPart = base64UrlEncode(enc.encode(payload));
  const sigPart = base64UrlEncode(new Uint8Array(signature));
  return `${payloadPart}.${sigPart}`;
}

export async function verifyPayload(
  secret: string,
  token: string,
  expectedPayload?: string,
): Promise<string | null> {
  const dot = token.indexOf(".");
  if (dot <= 0) {
    return null;
  }
  const payloadPart = token.slice(0, dot);
  const sigPart = token.slice(dot + 1);
  const payload = base64UrlDecodeToString(payloadPart);
  if (payload === null) {
    return null;
  }
  if (expectedPayload !== undefined && payload !== expectedPayload) {
    return null;
  }

  const key = await importHmacKey(secret);
  const enc = new TextEncoder();
  const sigBytes = base64UrlDecode(sigPart);
  if (!sigBytes || sigBytes.length === 0) {
    return null;
  }

  const signatureCopy = new Uint8Array(sigBytes);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    signatureCopy,
    enc.encode(payload),
  );
  return valid ? payload : null;
}

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 16) {
    return secret;
  }
  if (process.env.NODE_ENV === "development") {
    return "dev-nivadi-session-secret-min-16";
  }
  throw new Error(
    "Set SESSION_SECRET in the environment (see .env.example). Use: openssl rand -base64 32",
  );
}
