import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

/**
 * Google sign-in is optional at build time: the site has to keep building and
 * running for anyone who has not set up Google credentials yet (CI, a fresh
 * clone, a preview deploy). When the variables are missing the provider is
 * simply not registered and the UI hides the Google button.
 */
export const googleConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
)

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
    jwt({ token, profile }) {
      // Google's `sub` is the stable account id; email can change.
      if (profile?.sub) token.googleId = profile.sub
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.googleId as string) ?? token.sub ?? ""
      }
      return session
    },
  },

  trustHost: true,
})
