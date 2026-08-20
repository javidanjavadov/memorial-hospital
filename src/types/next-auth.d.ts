import type { DefaultSession } from "next-auth"
import type { SessionProfile } from "@/auth"

declare module "next-auth" {
  interface Session {
    user: {
      /** Google's stable account id (`sub`), not the email. */
      id: string
      /**
       * Patient details Google cannot supply, written only by /api/profile
       * after server-side validation. Null until they have been filled in.
       */
      profile: SessionProfile | null
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    googleId?: string
    profile?: SessionProfile
  }
}
