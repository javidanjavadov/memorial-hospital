import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { buildFullName, createProfileSchema } from "@/lib/profile-schema"
import { azValidationMessages } from "@/lib/validation"

/**
 * Google sign-in is optional at build time: the site has to keep building and
 * running for anyone who has not set up Google credentials yet (CI, a fresh
 * clone, a preview deploy). When the variables are missing the provider is
 * simply not registered and the UI hides the Google button.
 */
export const googleConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
)

/**
 * The patient details Google does not supply, carried in the session token.
 *
 * The token is signed with AUTH_SECRET and sent as an httpOnly cookie, so the
 * browser cannot read or forge it — which is the whole point. The previous
 * store was localStorage, where editing one object in devtools made you any
 * patient you liked.
 */
export interface SessionProfile {
  firstName: string
  lastName: string
  fatherName: string
  gender: "MALE" | "FEMALE"
  birthDate: string
  phone: string
  finCode: string
  fullName: string
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: googleConfigured
    ? [
        Google({
          clientId: process.env.AUTH_GOOGLE_ID,
          clientSecret: process.env.AUTH_GOOGLE_SECRET,
          // Always show the account chooser — on a shared machine, silently
          // reusing the last Google account would sign someone into a stranger's
          // medical profile.
          authorization: {
            params: { prompt: "select_account" },
          },
        }),
      ]
    : [],

  // No database yet, so the session lives in a signed, httpOnly JWT cookie
  // rather than a server-side session table.
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },

  pages: {
    signIn: "/giris",
    error: "/giris",
  },

  callbacks: {
    jwt({ token, profile, trigger, session }) {
      // Google's `sub` is the stable account id; email can change.
      if (profile?.sub) token.googleId = profile.sub

      /*
       * The only way patient details enter the token — and the validation is
       * here, in the callback, rather than in a route handler.
       *
       * That is deliberate. This callback runs on the server and is what
       * actually writes the cookie, so a client calling update() can submit a
       * payload but cannot decide what is stored: anything that fails the
       * schema is dropped on the floor. Doing the check in a route handler and
       * then calling unstable_update() looked equivalent but did not persist —
       * the rewritten cookie never reached the browser, so the details were
       * gone on the next request and the visitor was asked for them again.
       */
      if (trigger === "update") {
        const incoming = (session as { user?: { profile?: unknown } })?.user
          ?.profile
        /* The bundle is only used for messages, and nothing here surfaces them:
           this is the last line of defence, not the form. */
        const parsed = createProfileSchema(azValidationMessages).safeParse(incoming)
        if (parsed.success) {
          token.profile = {
            ...parsed.data,
            fullName: buildFullName(parsed.data),
          }
        }
      }

      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.googleId as string) ?? token.sub ?? ""
        session.user.profile = (token.profile as SessionProfile) ?? null
      }
      return session
    },
  },

  trustHost: true,
})
