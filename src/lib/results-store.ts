import "server-only"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

/**
 * Reads laboratory results from private/results, which is gitignored.
 *
 * Results are medical records, so they live outside `public/` — a file under
 * public/ is served by URL to anyone who knows the path, with no session check
 * and no way to revoke it. Everything here goes through a route handler that
 * checks who is asking.
 *
 * This is a stand-in for the hospital's own results service, not a substitute
 * for it. It reads from disk, so it works where the files exist and returns
 * nothing where they do not.
 */

export type ResultFlag = "normal" | "high" | "low"

/** A field the laboratory may hold in several languages. */
export type Localised = string | Partial<Record<"az" | "ru" | "en" | "tr", string>>

export interface ResultTest {
  name: Localised
  code?: string
  value: string
  unit?: string
  reference?: string
  flag?: ResultFlag
}

export interface ResultPanel {
  name: Localised
  tests: ResultTest[]
}

export interface PatientResult {
  id: string
  /** STRIX / KART NO as printed on the report. */
  cardNo: string
  collectedAt: string
  reportedAt: string
  branch?: string
  doctor?: string
  /** Filename under private/results/files. Never sent to the browser. */
  pdf?: string
  panels: ResultPanel[]
}

interface ResultsFile {
  patients: Record<string, PatientResult[]>
}

const ROOT = join(process.cwd(), "private", "results")

const normalizeEmail = (email: string) => email.trim().toLowerCase()

async function readIndex(): Promise<ResultsFile | null> {
  try {
    const raw = await readFile(join(ROOT, "index.json"), "utf8")
    return JSON.parse(raw) as ResultsFile
  } catch {
    // Absent or malformed is the normal case on a fresh clone and in
    // production. No results is not an error.
    return null
  }
}

/** Results belonging to one signed-in account. Never a fuzzy match. */
export async function resultsForEmail(email: string): Promise<PatientResult[]> {
  const index = await readIndex()
  if (!index?.patients) return []

  const wanted = normalizeEmail(email)
  for (const [key, results] of Object.entries(index.patients)) {
    if (normalizeEmail(key) === wanted) return results
  }
  return []
}

/**
 * The PDF for one result, only if it belongs to this account.
 *
 * The filename comes from the index, never from the request — a caller-supplied
 * name is how `../../.env` gets read off the server.
 */
export async function resultPdfForEmail(
  email: string,
  resultId: string
): Promise<{ file: Buffer; filename: string } | null> {
  const results = await resultsForEmail(email)
  const match = results.find((result) => result.id === resultId)
  if (!match?.pdf) return null

  try {
    const file = await readFile(join(ROOT, "files", match.pdf))
    return { file, filename: match.pdf }
  } catch {
    return null
  }
}

/**
 * Picks one language out of a field the laboratory holds in several.
 *
 * A test name is medical text a patient reads, so it follows the page like
 * everything else. A plain string means the laboratory has only one language
 * for it, which is what most systems hold — it is then shown as it is rather
 * than hidden.
 */
const say = (value: Localised, locale: string): string =>
  typeof value === "string"
    ? value
    : (value[locale as "az"] ?? value.az ?? Object.values(value)[0] ?? "")

/** Strips the PDF filename, and speaks one language. */
export const toPublicResult = (
  { pdf, ...result }: PatientResult,
  locale: string
) => ({
  ...result,
  hasPdf: Boolean(pdf),
  panels: result.panels.map((panel) => ({
    ...panel,
    name: say(panel.name, locale),
    tests: panel.tests.map((test) => ({ ...test, name: say(test.name, locale) })),
  })),
})

export type PublicResult = ReturnType<typeof toPublicResult>
