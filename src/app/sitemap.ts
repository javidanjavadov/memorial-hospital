import type { MetadataRoute } from "next"
import { siteUrl } from "@/lib/site"

/** Public, indexable routes. Account pages are deliberately excluded. */
const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/haqqimizda", priority: 0.8, changeFrequency: "monthly" },
  { path: "/hekimler", priority: 0.9, changeFrequency: "weekly" },
  { path: "/xidmetler", priority: 0.9, changeFrequency: "weekly" },
  { path: "/filiallar", priority: 0.8, changeFrequency: "monthly" },
  { path: "/qebul", priority: 0.9, changeFrequency: "monthly" },
  { path: "/elaqe", priority: 0.7, changeFrequency: "monthly" },
  { path: "/sertler", priority: 0.3, changeFrequency: "yearly" },
  { path: "/siyaset", priority: 0.3, changeFrequency: "yearly" },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }))
}
