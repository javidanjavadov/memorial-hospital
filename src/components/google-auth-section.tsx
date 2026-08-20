import GoogleSignInButton from "@/components/google-sign-in-button"

/**
 * Google button plus its divider, rendered only when Google is configured.
 *
 * `enabled` is resolved on the server and passed in, rather than discovered in
 * the browser via `getProviders()`. That earlier approach meant a network round
 * trip to /api/auth/providers before the button could appear at all, so on a
 * cold serverless function it showed up seconds late — the same defect the
 * navbar's login button had.
 *
 * No "use client" here: this renders no interactivity of its own, so it stays a
 * Server Component and ships in the initial HTML.
 */
export default function GoogleAuthSection({
  enabled,
  label,
  callbackUrl,
  divider = false,
}: {
  enabled: boolean
  label?: string
  /** Same-site path to return to after Google sends the visitor back. */
  callbackUrl?: string
  /** The "və ya" rule, for pages that still have a second option below it. */
  divider?: boolean
}) {
  if (!enabled) return null

  return (
    <>
      <GoogleSignInButton label={label} callbackUrl={callbackUrl} />
      {divider && (
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-3 text-xs uppercase tracking-wide text-slate-400">
              və ya
            </span>
          </div>
        </div>
      )}
    </>
  )
}
