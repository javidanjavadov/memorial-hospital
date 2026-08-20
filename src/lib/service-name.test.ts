import { describe, expect, it } from "vitest"
import { shortServiceName } from "@/lib/service-name"

describe("shortServiceName", () => {
  it("trims a long bracketed allergen list", () => {
    const full =
      "FP1/5 Qida Paneli 1 spesifik IgE (F13-Yerfındığı F17-Fındıq F18-Braziliya qozu F20-Badam F36-Kokos)"
    expect(shortServiceName(full)).toBe(
      "FP1/5 Qida Paneli 1 spesifik IgE (F13-Yerfındığı…)"
    )
  })

  it("leaves a short name alone", () => {
    expect(shortServiceName("Ferritin")).toBe("Ferritin")
    expect(shortServiceName("Kreatinin (sidik)")).toBe("Kreatinin (sidik)")
  })

  /*
   * The reason the bracket is kept rather than dropped. Two X-rays that differ
   * only by side must not print the same name, or someone orders the wrong foot.
   */
  it("keeps left and right distinguishable", () => {
    const right = shortServiceName(
      "Pəncə rentgenoqrafiyası (sağ pəncə, iki proyeksiyada çəkiliş)"
    )
    const left = shortServiceName(
      "Pəncə rentgenoqrafiyası (sol pəncə, iki proyeksiyada çəkiliş)"
    )
    expect(right).not.toBe(left)
  })

  it("never trims away the whole name", () => {
    const trimmed = shortServiceName(
      "X (very long parenthetical that goes on and on and on and on and on)"
    )
    expect(trimmed).toContain("X")
  })

  it("marks a trim with an ellipsis so nothing looks complete when it is not", () => {
    const trimmed = shortServiceName(
      "Alatop Allergik skrin (D1-Dust Mite E1-Pişik E5-İt G2-Bermud otu G6-Pişikquyruğu M1-Mold)"
    )
    expect(trimmed.endsWith("…)")).toBe(true)
  })
})
