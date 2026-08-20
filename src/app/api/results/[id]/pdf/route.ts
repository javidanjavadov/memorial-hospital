import { auth } from "@/auth"
import { getDictionary } from "@/i18n"
import { resultPdfForEmail } from "@/lib/results-store"

/**
 * Streams one report, and only to the account it belongs to.
 *
 * The file is read from private/results/files by the name recorded in the
 * index — never by a name from the URL, which is how a path like `../../.env`
 * ends up being served. The id is checked against this patient's own results
 * first, so guessing another id returns 404 rather than someone else's report.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const t = await getDictionary()
  const session = await auth()
  const email = session?.user?.email
  if (!email) return new Response(t.ui.sessionNotFound, { status: 401 })

  const { id } = await params
  const found = await resultPdfForEmail(email, id)
  // Same answer whether the result belongs to someone else or does not exist:
  // distinguishing them would confirm which ids are real.
  if (!found) return new Response(t.ui.notFoundShort, { status: 404 })

  return new Response(new Uint8Array(found.file), {
    headers: {
      "Content-Type": "application/pdf",
      // inline: opens in the viewer rather than downloading, which is what
      // "PDF açılsın" asks for.
      "Content-Disposition": `inline; filename="${found.filename}"`,
      "Cache-Control": "no-store, private",
    },
  })
}
