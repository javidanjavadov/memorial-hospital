/**
 * Short display name for a catalogue test.
 *
 * Many laboratory names carry the whole allergen or analyte list in brackets —
 * "FP1/5 Qida Paneli 1 spesifik IgE (F13-Yerfındığı F17-Fındıq F18-Braziliya
 * qozu F20-Badam F36-Kokos)" — which belongs on the record but not on a card
 * five to a row, where it turns every card into a paragraph.
 *
 * Only the bracket is trimmed, and only when it is long. A short qualifier is
 * kept whole because it is frequently the only thing separating two entries:
 * dropping it would print the same name on the left-foot and right-foot X-ray.
 * The opening of a long bracket is kept for the same reason, so laterality or
 * an age band still shows.
 *
 * Display only. The full name is what goes on the order, what the info dialog
 * shows and what the title attribute carries, and the ellipsis marks that there
 * is more rather than implying the name ends there.
 */
export function shortServiceName(name: string) {
  const cut = name.indexOf(" (")
  // Needs a real name in front of the bracket, and a bracket long enough to be
  // the problem — anything shorter reads better intact.
  if (cut < 12 || name.length - cut < 32) return name

  const inner = name.slice(cut + 2)
  const close = inner.indexOf(")")
  if (close !== -1 && close <= KEEP) return name.slice(0, cut + 2 + close + 1)

  const wordBreak = inner.lastIndexOf(" ", KEEP)
  const head = inner.slice(0, wordBreak > 6 ? wordBreak : KEEP).replace(/[ ,;]+$/, "")
  return `${name.slice(0, cut).trimEnd()} (${head}…)`
}

/** How much of a long bracket to keep, in characters. */
const KEEP = 24
