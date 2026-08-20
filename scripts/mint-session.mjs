/**
 * Mints a valid Auth.js session cookie for local testing.
 *
 * Dev-only: it needs AUTH_SECRET, so it proves nothing about security — it
 * exists so the signed-in paths (profile complete / incomplete, sign-out) can
 * be exercised without a real Google round trip.
 */
import { readFileSync } from "node:fs"
import { encode } from "next-auth/jwt"

const env = readFileSync(".env.local", "utf8")
const secret = env.match(/^AUTH_SECRET=(.*)$/m)?.[1]?.trim()
if (!secret) throw new Error("AUTH_SECRET not found in .env.local")

const complete = process.argv[2] === "complete"
// Optional third argument: the email to mint the session for, so the
// results allowlist can be exercised without a real Google round trip.
const email = process.argv[3] ?? "test@example.com"

const token = await encode({
  token: {
    sub: "test-user",
    googleId: "test-user",
    name: "Test İstifadəçi",
    email,
    ...(complete
      ? {
          profile: {
            firstName: "Aysel",
            lastName: "Məmmədova",
            fatherName: "Elxan",
            gender: "FEMALE",
            birthDate: "1990-04-12",
            phone: "0557101050",
            finCode: "5JK8Q2A",
            fullName: "Məmmədova Aysel Elxan",
          },
        }
      : {}),
  },
  secret,
  salt: "authjs.session-token",
})

console.log(token)
