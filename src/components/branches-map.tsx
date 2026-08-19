"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Navigation, Phone } from "lucide-react"
import { branches, telHref } from "@/data"
import { cn } from "@/lib/utils"
import "leaflet/dist/leaflet.css"

/**
 * All three branches on one map.
 *
 * Leaflet rather than an OpenStreetMap iframe: the simple embed takes a single
 * `marker` parameter, so showing three at once is not something it can do.
 * Leaflet needs no API key and no billing account, and the tiles come straight
 * from OpenStreetMap.
 *
 * The catch is geography — Ganja is roughly 300km from Baku, so a view framing
 * all three sits at country zoom, where the two Baku branches land almost on
 * top of each other. The list beside the map fixes that: picking a branch flies
 * to it at street level, and "Hamısı" returns to the fitted view.
 *
 * Loaded via next/dynamic with ssr:false — Leaflet touches `window` on import.
 */
export default function BranchesMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import("leaflet").Map | null>(null)
  const markersRef = useRef<Record<string, import("leaflet").Marker>>({})
  const [active, setActive] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const node = containerRef.current
    if (!node || mapRef.current) return

    let cancelled = false

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return

      const map = L.map(node, { scrollWheelZoom: false }).setView(
        [40.4, 49.0],
        7
      )
      mapRef.current = map

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)

      /*
       * A divIcon rather than Leaflet's default marker: the default pulls its
       * PNGs from paths relative to the stylesheet, which a bundler rewrites,
       * and the icons silently 404. Inline SVG has no such dependency and can
       * carry the brand colour.
       */
      const icon = L.divIcon({
        className: "",
        html: `<span style="display:block;width:28px;height:28px;border-radius:9999px;background:var(--primary);border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></span>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })

      const bounds = L.latLngBounds([])
      for (const branch of branches) {
        const latlng: [number, number] = [
          Number(branch.latitude),
          Number(branch.longitude),
        ]
        const marker = L.marker(latlng, { icon, title: branch.name })
          .addTo(map)
          .bindPopup(
            `<strong>${branch.name}</strong><br>${branch.address}`
          )
        marker.on("click", () => setActive(branch.id))
        markersRef.current[branch.id] = marker
        bounds.extend(latlng)
      }

      map.fitBounds(bounds, { padding: [40, 40] })
      setReady(true)
    })

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
      markersRef.current = {}
    }
  }, [])

  /*
   * Leaflet's flyTo is driven entirely by requestAnimationFrame. Where frames
   * are throttled — a background tab, or a machine asking for reduced motion —
   * it never advances and the map simply never moves. Jumping straight there
   * respects the preference and cannot get stuck.
   */
  const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const focus = (id: string | null) => {
    setActive(id)
    const map = mapRef.current
    if (!map) return

    const animate = !prefersReducedMotion()

    if (!id) {
      import("leaflet").then((L) => {
        const bounds = L.latLngBounds(
          branches.map((b) => [Number(b.latitude), Number(b.longitude)])
        )
        map.fitBounds(bounds, { padding: [40, 40], animate })
      })
      return
    }

    const branch = branches.find((b) => b.id === id)
    if (!branch) return
    const latlng: [number, number] = [
      Number(branch.latitude),
      Number(branch.longitude),
    ]
    if (animate) map.flyTo(latlng, 16, { duration: 0.8 })
    else map.setView(latlng, 16, { animate: false })
    markersRef.current[id]?.openPopup()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="relative overflow-hidden rounded-xl border border-[var(--line)]">
        <div ref={containerRef} className="h-[420px] w-full lg:h-[520px]" />
        {!ready && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-[var(--secondary)] text-sm text-slate-600"
            role="status"
          >
            Xəritə yüklənir...
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => focus(null)}
          className={cn(
            "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
            active === null
              ? "border-primary bg-primary text-white"
              : "border-[var(--line)] bg-white text-slate-700 hover:border-primary/40"
          )}
        >
          Hamısı
        </button>

        {branches.map((branch) => (
          <button
            key={branch.id}
            type="button"
            onClick={() => focus(branch.id)}
            aria-pressed={active === branch.id}
            className={cn(
              "rounded-xl border p-4 text-left transition-colors",
              active === branch.id
                ? "border-primary bg-primary/5"
                : "border-[var(--line)] bg-white hover:border-primary/40"
            )}
          >
            <span className="flex items-start gap-2">
              <MapPin
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span className="block font-medium text-slate-900">
                  {branch.name}
                </span>
                <span className="mt-0.5 block text-sm text-slate-600">
                  {branch.address}
                </span>
              </span>
            </span>
          </button>
        ))}

        <div className="mt-1 flex gap-2">
          <a
            href={telHref(branches[0].phone)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-primary/40"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            Zəng et
          </a>
          <a
            href={
              branches.find((b) => b.id === active)?.mapUrl ?? branches[0].mapUrl
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-primary/40"
          >
            <Navigation className="h-4 w-4" aria-hidden="true" />
            Yol göstər
          </a>
        </div>
      </div>
    </div>
  )
}
