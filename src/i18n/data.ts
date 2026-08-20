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
