import { NextResponse } from "next/server"
import { auth, unstable_update } from "@/auth"
import { buildFullName, profileSchema } from "@/lib/profile-schema"

/**
 * Writes the patient details Google cannot supply into the session.
 *
 * This is the only path by which they can be set. Validation happens here, on
 * the server, and the result goes into the signed httpOnly session cookie — so
 * a FIN or a date of birth cannot be forged by editing browser storage, which
 * is exactly what the previous localStorage profile allowed.
 *
 * Requires an authenticated session: there is nothing to attach details to
 * otherwise, and an unauthenticated writer could only be attacking.
 */
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sessiya tapılmadı" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Yanlış sorğu" }, { status: 400 })
  }

  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) {
    /*
     * Field-level messages so the form can point at what is wrong. They are the
     * schema's own Azerbaijani messages — safe to return, since they describe
     * the input the caller just sent and nothing about anyone else.
     */
    const fields: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (typeof key === "string" && !fields[key]) fields[key] = issue.message
    }
    return NextResponse.json({ error: "Məlumatlar düzgün deyil", fields }, { status: 400 })
  }

  const profile = { ...parsed.data, fullName: buildFullName(parsed.data) }

  await unstable_update({ user: { ...session.user, profile } })

  return NextResponse.json({ ok: true, profile })
}
