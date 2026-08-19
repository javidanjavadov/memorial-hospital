import GirisForm from "./giris-form"
import { googleConfigured } from "@/lib/auth-flags"

/**
 * Server wrapper whose only job is to resolve whether Google sign-in is
 * available and hand that down.
 *
 * The form used to discover this by calling `getProviders()` from the browser,
 * which meant the Google button could not render until /api/auth/providers
 * answered — seconds, on a cold serverless function. Deciding it here puts the
 * answer straight into the HTML.
 */
export default function GirisPage() {
  return <GirisForm googleEnabled={googleConfigured} />
}
