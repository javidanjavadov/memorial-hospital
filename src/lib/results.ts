import type { Gender } from "@/lib/auth-store"

/**
 * Lookup of a laboratory order's results.
 *
 * NOT IMPLEMENTED — deliberately, and it must stay that way until a real
 * backend exists.
 *
 * Results are medical records. Fetching them requires a server that can
 * authenticate the request, rate-limit it, and log the access; none of that can
 * live in the browser, where any key or endpoint shipped to the client is
 * readable by anyone. The hospital's own API exposes
 * `/api/v1/client/certificate`, but its request contract is undocumented and
 * discovering it would mean firing guessed patient identifiers at a live
 * medical endpoint — so the shape below is ours, not theirs, and needs
 * reconciling with the real service before it is wired up.
 *
 * When implementing:
 *   - do the lookup in a Route Handler, never from the client
 *   - rate-limit by IP and by patient id; four short fields are guessable
 *   - do not reveal which field was wrong ("not found" for every failure)
 *   - log every access attempt, successful or not
 *   - never put an identifier in a URL — POST only, and no-store
 */

export interface ResultLookupRequest {
  patientId: string
  orderId: string
  /** ISO date, yyyy-mm-dd. */
  birthDate: string
  securityCode: string
}

export interface ResultLine {
  code: string
  name: string
  value: string
  unit: string
  referenceRange: string
  /** Outside the reference range — surfaced so it can be flagged visually. */
  abnormal: boolean
}

export interface ResultOrder {
  orderId: string
  patientName: string
  gender: Gender
  collectedAt: string
  reportedAt: string
  status: "READY" | "IN_PROGRESS" | "PARTIAL"
  lines: ResultLine[]
  pdfUrl?: string
}

export type ResultLookupOutcome =
  | { ok: true; order: ResultOrder }
  | { ok: false; error: string }

/** Set once a results endpoint exists; the UI hides the feature until then. */
export const RESULTS_LOOKUP_ENABLED = false

export async function lookupResults(
  _request: ResultLookupRequest
): Promise<ResultLookupOutcome> {
  void _request
  return {
    ok: false,
    error:
      "Nəticə sorğusu hazırda onlayn işləmir. Zəhmət olmasa çağrı mərkəzimizlə əlaqə saxlayın.",
  }
}
