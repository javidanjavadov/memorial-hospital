"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Pencil,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, controlClass } from "@/components/ui/field"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MAX_FAMILY_MEMBERS,
  RELATIONS,
  membersFor,
  useFamilyStore,
  type FamilyMember,
  type Relation,
} from "@/lib/family-store"
import { createValidators } from "@/lib/validation"
import { useCurrentUser } from "@/lib/use-current-user"
import { useT } from "@/i18n/client"
import type azDict from "@/i18n/dictionaries/az.json"

/**
 * A relative carries the same identifying fields as the account holder.
 *
 * Not a nicety: an order filed with a blank FIN or date of birth reaches the
 * laboratory as a sample that cannot be matched to a person or read against a
 * reference range. The one relaxation is the phone number — a child has none,
 * and reception rings the account holder anyway.
 */
const buildMemberSchema = (t: ReturnType<typeof useT>) => {
  const v = createValidators(t.validation)
  return z.object({
    firstName: v.firstName,
    lastName: v.lastName,
    fatherName: v.fatherName,
    gender: v.gender,
    birthDate: v.birthDate,
    finCode: v.requiredFinCode,
    phone: v.optionalPhoneNumber,
    relation: z.enum(RELATIONS, { message: t.family.selectRelation }),
  })
}

type MemberSchema = ReturnType<typeof buildMemberSchema>
type MemberInput = z.input<MemberSchema>
type MemberData = z.output<MemberSchema>

/** Dictionary keys, resolved at render: a module constant cannot know the locale. */
const RELATION_LABELS: Record<Relation, keyof (typeof azDict)["family"]> = {
  spouse: "relationSpouse",
  child: "relationChild",
  parent: "relationParent",
  sibling: "relationSibling",
  other: "relationOther",
}

/** dd.MM.yyyy — see the note in src/app/profil/page.tsx on az-AZ formatting. */
const formatDate = (iso: string) => {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
}

const EMPTY: MemberInput = {
  firstName: "",
  lastName: "",
  fatherName: "",
  gender: "FEMALE",
  birthDate: "",
  finCode: "",
  phone: "",
  relation: "spouse",
}

/**
 * The relatives an account may book and order for, and the form that adds them.
 *
 * Lives on the profile rather than in the booking form: adding a person is
 * account admin, and burying it inside a booking would mean filling in a
 * relative's FIN while a slot is being held.
 */
export default function FamilySection() {
  const t = useT()
  const schema = useMemo(() => buildMemberSchema(t), [t])
  const { user } = useCurrentUser()

  const allMembers = useFamilyStore((s) => s.members)
  const hasHydrated = useFamilyStore((s) => s.hasHydrated)
  const addMember = useFamilyStore((s) => s.addMember)
  const updateMember = useFamilyStore((s) => s.updateMember)
  const removeMember = useFamilyStore((s) => s.removeMember)

  /** null = closed, "new" = adding, otherwise the id being edited. */
  const [editing, setEditing] = useState<string | null>(null)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")

  const members = useMemo(
    () => (hasHydrated ? membersFor(allMembers, user?.id) : []),
    [allMembers, user?.id, hasHydrated]
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MemberInput, unknown, MemberData>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  })

  const openAdd = () => {
    setError("")
    setNotice("")
    reset(EMPTY)
    setEditing("new")
  }

  const openEdit = (member: FamilyMember) => {
    setError("")
    setNotice("")
    reset({
      firstName: member.firstName,
      lastName: member.lastName,
      fatherName: member.fatherName,
      gender: member.gender,
      birthDate: member.birthDate,
      finCode: member.finCode,
      phone: member.phone,
      relation: member.relation,
    })
    setEditing(member.id)
  }

  const close = () => {
    setEditing(null)
    setError("")
    reset(EMPTY)
  }

  const onSubmit = (data: MemberData) => {
    if (!user) return
    setError("")

    // The schema drops a blank phone to undefined; the store keeps a string, so
    // "no number" stays one value rather than two that read the same.
    const input = { ...data, phone: data.phone ?? "" }

    const result =
      editing === "new"
        ? addMember(user.id, input)
        : updateMember(user.id, editing as string, input)

    if (!result.ok) {
      setError(t.ui[result.error])
      return
    }

    setNotice(t.family.saved)
    close()
  }

  const onRemove = (member: FamilyMember) => {
    if (!user) return
    /*
     * A confirm() rather than a custom dialog: removing a relative throws away
     * their details, and this build has no undo to offer.
     */
    if (!window.confirm(t.f(t.family.removeConfirm, { name: member.fullName }))) {
      return
    }
    const result = removeMember(user.id, member.id)
    if (!result.ok) {
      setError(t.ui[result.error])
      return
    }
    setNotice(t.family.removed)
    if (editing === member.id) close()
  }

  const atLimit = members.length >= MAX_FAMILY_MEMBERS

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" aria-hidden="true" />
              {t.family.title}
            </CardTitle>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              {t.family.subtitle}
            </p>
          </div>

          {editing === null && (
            <Button variant="cta" onClick={openAdd} disabled={atLimit}>
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              {t.family.addMember}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {notice && editing === null && (
          <p
            className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800"
            role="status"
          >
            <CheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {notice}
          </p>
        )}

        {error && (
          <p
            className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        {atLimit && editing === null && (
          <p className="text-sm text-[var(--ink-muted)]">
            {t.ui.familyLimitReached}
          </p>
        )}

        {/* The list */}
        {members.length === 0 && editing === null ? (
          <div className="rounded-xl border border-dashed border-[var(--line)] p-8 text-center">
            <Users
              className="mx-auto mb-3 h-8 w-8 text-[var(--ink-muted)]"
              aria-hidden="true"
            />
            <p className="font-medium text-[var(--ink)]">{t.family.empty}</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-[var(--ink-muted)]">
              {t.family.emptyHint}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-[var(--line)] p-4"
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--ink)] text-sm font-bold text-white"
                  aria-hidden="true"
                >
                  {member.fullName
                    .split(" ")
                    .filter(Boolean)
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium uppercase text-[var(--ink)]">
                      {member.fullName}
                    </p>
                    <Badge variant="secondary">
                      {t.family[RELATION_LABELS[member.relation]]}
                    </Badge>
                  </div>
                  <dl className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--ink-muted)]">
                    <div className="flex gap-1">
                      <dt>{t.profile.birthDate}:</dt>
                      <dd className="font-medium text-[var(--ink)]">
                        {formatDate(member.birthDate)}
                      </dd>
                    </div>
                    <div className="flex gap-1">
                      <dt className="sr-only">{t.profile.gender}</dt>
                      <dd>
                        {member.gender === "FEMALE"
                          ? t.profile.female
                          : t.profile.male}
                      </dd>
                    </div>
                    <div className="flex gap-1">
                      <dt>{t.profile.finCode}:</dt>
                      <dd className="font-mono font-medium text-[var(--ink)]">
                        {member.finCode}
                      </dd>
                    </div>
                    {member.phone && (
                      <div className="flex gap-1">
                        <dt>{t.common.phone}:</dt>
                        <dd className="font-medium text-[var(--ink)]">
                          {member.phone}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(member)}
                    aria-label={`${t.family.editMember}: ${member.fullName}`}
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemove(member)}
                    aria-label={`${t.family.removeMember}: ${member.fullName}`}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* The form */}
        {editing !== null && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="rounded-xl border border-[var(--line)] p-4 md:p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-step-0 text-[var(--ink)]">
                {editing === "new" ? t.family.addMember : t.family.editMember}
              </h3>
              <Button variant="outline" size="sm" onClick={close} type="button">
                <X className="h-4 w-4" aria-hidden="true" />
                {t.common.cancel}
              </Button>
            </div>

            <p className="mb-5 text-sm text-[var(--ink-muted)]">
              {t.family.detailsNote}
            </p>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Field
                label={t.profile.lastName}
                required
                error={errors.lastName?.message}
              >
                {(field) => (
                  <Input
                    {...field}
                    {...register("lastName")}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                )}
              </Field>

              <Field
                label={t.profile.firstName}
                required
                error={errors.firstName?.message}
              >
                {(field) => (
                  <Input
                    {...field}
                    {...register("firstName")}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                )}
              </Field>

              <Field
                label={t.profile.fatherName}
                required
                error={errors.fatherName?.message}
              >
                {(field) => (
                  <Input
                    {...field}
                    {...register("fatherName")}
                    className={errors.fatherName ? "border-red-500" : ""}
                  />
                )}
              </Field>

              <Field
                label={t.family.relation}
                required
                error={errors.relation?.message}
              >
                {(field) => (
                  <select
                    {...field}
                    {...register("relation")}
                    className={controlClass}
                  >
                    {RELATIONS.map((relation) => (
                      <option key={relation} value={relation}>
                        {t.family[RELATION_LABELS[relation]]}
                      </option>
                    ))}
                  </select>
                )}
              </Field>

              <Field
                label={t.profile.gender}
                required
                error={errors.gender?.message}
              >
                {(field) => (
                  <select
                    {...field}
                    {...register("gender")}
                    className={controlClass}
                  >
                    <option value="FEMALE">{t.profile.female}</option>
                    <option value="MALE">{t.profile.male}</option>
                  </select>
                )}
              </Field>

              <Field
                label={t.profile.birthDate}
                required
                error={errors.birthDate?.message}
              >
                {(field) => (
                  <Input
                    {...field}
                    type="date"
                    {...register("birthDate")}
                    className={errors.birthDate ? "border-red-500" : ""}
                  />
                )}
              </Field>

              <Field
                label={t.profile.finCode}
                required
                error={errors.finCode?.message}
              >
                {(field) => (
                  <Input
                    {...field}
                    placeholder={t.profile.finCodeHint}
                    maxLength={7}
                    {...register("finCode")}
                    className={errors.finCode ? "border-red-500" : ""}
                  />
                )}
              </Field>

              <Field
                label={t.common.phone}
                hint={t.family.phoneOptional}
                error={errors.phone?.message}
              >
                {(field) => (
                  <Input
                    {...field}
                    type="tel"
                    placeholder="+994 XX XXX XX XX"
                    {...register("phone")}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                )}
              </Field>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="submit" variant="cta" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                )}
                {t.common.save}
              </Button>
              <Button type="button" variant="outline" onClick={close}>
                {t.common.cancel}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
