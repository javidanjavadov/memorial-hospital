import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      /** Google's stable account id (`sub`), not the email. */
      id: string
    } & DefaultSession["user"]
  }
}
