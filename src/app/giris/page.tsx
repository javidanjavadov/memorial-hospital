import { Suspense } from "react"
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
  /*
   * The form reads ?next= to return the visitor where they came from, and
   * useSearchParams needs a boundary or the whole route falls out of static
   * rendering.
   */
  return (
    <Suspense fallback={null}>
      <GirisForm googleEnabled={googleConfigured} />
    </Suspense>
  )
}
