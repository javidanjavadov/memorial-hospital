/**
 * Whether Google sign-in is configured.
 *
 * Kept separate from `@/auth` so a Server Component can read the flag without
 * pulling the whole NextAuth setup into its module graph. Server-only: the
 * credentials are deliberately not `NEXT_PUBLIC_*`, so this must never be
 * imported from a Client Component.
 */
export const googleConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
)
