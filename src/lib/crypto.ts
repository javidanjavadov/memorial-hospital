/**
 * Password hashing for the browser-only demo store.
 *
 * IMPORTANT: this is a mitigation, not a solution. PBKDF2 in the browser keeps
 * plaintext passwords out of localStorage, but the whole auth flow still runs on
 * the client and is therefore trivially bypassable. Before this site handles a
 * real patient, authentication has to move to a server with httpOnly session
 * cookies. See README.md ("Known limitations").
 */

const ITERATIONS = 100_000
const KEY_LENGTH = 32
const SALT_LENGTH = 16

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

const fromHex = (hex: string) => {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

const derive = async (password: string, salt: Uint8Array) => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    key,
    KEY_LENGTH * 8
  )
  return new Uint8Array(bits)
}

/** Returns a self-describing `pbkdf2$<iterations>$<salt>$<hash>` string. */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const hash = await derive(password, salt)
  return `pbkdf2$${ITERATIONS}$${toHex(salt)}$${toHex(hash)}`
}

/** Constant-time comparison so verification does not leak the hash byte by byte. */
const timingSafeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const [scheme, iterations, salt, hash] = stored.split("$")
  if (scheme !== "pbkdf2" || !salt || !hash) return false

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: fromHex(salt) as BufferSource,
      iterations: Number(iterations) || ITERATIONS,
      hash: "SHA-256",
    },
    key,
    (hash.length / 2) * 8
  )
  return timingSafeEqual(toHex(new Uint8Array(bits)), hash)
}

/** Collision-resistant ids. `Math.random()` is not suitable for record keys. */
export const generateId = (): string => {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID()
  // Older Safari: still cryptographically random, just not a formatted UUID.
  return `${Date.now().toString(36)}-${toHex(
    crypto.getRandomValues(new Uint8Array(8))
  )}`
}
