import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.papanclip.hompimpa.biz.id";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          en: siteUrl,
          id: `${siteUrl}/id`
        }
      }
    },
    {
      url: `${siteUrl}/pricing`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: {
        languages: {
          en: `${siteUrl}/pricing`,
          id: `${siteUrl}/id/pricing`
        }
      }
    },
    {
      url: `${siteUrl}/faq`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: {
        languages: {
          en: `${siteUrl}/faq`,
          id: `${siteUrl}/id/faq`
        }
      }
    },
    {
      url: `${siteUrl}/id`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${siteUrl}/id/pricing`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7
    },
    {
      url: `${siteUrl}/id/faq`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5
    }

  ];
}
