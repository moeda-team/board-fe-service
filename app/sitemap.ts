import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.papanclip.hompimpa.biz.id";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const pages = [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/pricing", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/faq", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/changelog", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.5, changeFrequency: "yearly" as const },
    { path: "/terms-of-service", priority: 0.5, changeFrequency: "yearly" as const },
  ];

  return [
    ...pages.map((page) => ({
      url: `${siteUrl}${page.path}`,
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: {
          en: `${siteUrl}${page.path}`,
          id: `${siteUrl}/id${page.path}`,
          "x-default": `${siteUrl}${page.path}`
        }
      }
    })),
    ...pages
      .filter((p) => p.path)
      .map((page) => ({
        url: `${siteUrl}/id${page.path}`,
        lastModified,
        changeFrequency: page.changeFrequency,
        priority: page.priority - 0.1
      }))
  ];
}
