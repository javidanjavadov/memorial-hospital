import type { Dictionary } from "@/i18n"
import type { Branch, Department } from "@/data"

/**
 * Localises the hospital's own content — departments, branches, groups.
 *
 * The data in src/data stays Azerbaijani and stays the source of truth: ids,
 * coordinates, phone numbers and prices are not translations of anything. Only
 * the words a patient reads are looked up here, by id, and anything the
 * dictionary has no entry for falls through to the Azerbaijani.
 *
 * Keyed by id rather than by the Azerbaijani text: matching on the text means a
 * comma added to a department name silently drops its translation in three
 * languages, and nothing would fail to warn you.
 */

type DataDictionary = Dictionary["data"]

export function localizeDepartment(
  department: Department,
  data: DataDictionary
): Department {
  const translated = data?.departments?.[department.id]
  if (!translated) return department
  return {
    ...department,
    name: translated.name || department.name,
    description: translated.description || department.description,
  }
}

export function localizeBranch(branch: Branch, data: DataDictionary): Branch {
  const translated = data?.branches?.[branch.id]
  if (!translated) return branch
  return {
    ...branch,
    name: translated.name || branch.name,
    address: translated.address || branch.address,
    workingHours: translated.workingHours || branch.workingHours,
  }
}

/**
 * The five cards on the homepage services strip.
 *
 * They share their ids with departments — "laboratoriya", "poliklinika",
 * "checkup" — so they read from the same map rather than a second one that
 * would have to be kept in step by hand.
 */
export function localizeServiceCategory<
  T extends { id: string; name: string; description: string },
>(category: T, data: DataDictionary): T {
  const translated = data?.departments?.[category.id]
  if (!translated) return category
  return {
    ...category,
    name: translated.name || category.name,
    description: translated.description || category.description,
  }
}

/**
 * A doctor's specialty and honorific.
 *
 * Keyed by the Azerbaijani text rather than by an id: these are free-text
 * fields on the roster, shared by many doctors ("Terapevt" appears three
 * times), and there is no id to key on. A specialty the dictionary has not
 * caught up with shows the Azerbaijani, which is the doctor's real title
 * rather than a blank.
 */
export function localizeDoctor<
  T extends { name: string; specialty: string; title: string | null },
>(doctor: T, data: DataDictionary): T {
  return {
    ...doctor,
    name: data?.doctorNames?.[doctor.name] ?? doctor.name,
    specialty: data?.specialties?.[doctor.specialty] ?? doctor.specialty,
    title: doctor.title
      ? (data?.doctorTitles?.[doctor.title] ?? doctor.title)
      : doctor.title,
  }
}

/**
 * Accreditation copy, keyed by the mark (IAS / RIQAS / QCMD).
 *
 * The marks, logos and dimensions are not translated — they are the awarding
 * bodies' own names and assets.
 */
export function localizeAccreditation<
  T extends { mark: string; label: string; title: string; body: string; markNote: string },
>(entry: T, data: DataDictionary): T {
  const translated = data?.accreditations?.[entry.mark]
  if (!translated) return entry
  return {
    ...entry,
    label: translated.label || entry.label,
    title: translated.title || entry.title,
    body: translated.body || entry.body,
    markNote: translated.markNote || entry.markNote,
  }
}

/** Catalogue group name and blurb, keyed by the group's slug. */
export function localizeGroup(
  group: { slug: string; name: string; blurb: string },
  data: DataDictionary
) {
  const translated = data?.groups?.[group.slug]
  if (!translated) return group
  return {
    ...group,
    name: translated.name || group.name,
    blurb: translated.blurb || group.blurb,
  }
}

/**
 * The leading chip on a category strip.
 *
 * The label is generated at build time into the catalogue index, in
 * Azerbaijani, so it is matched here rather than carried through — the two
 * known values are "Populyar" and "Bütün həkimlər".
 */
export function localizeCategoryName(name: string, data: DataDictionary) {
  return data?.categories?.[name] ?? name
}
