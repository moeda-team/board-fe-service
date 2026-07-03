import type { Locale } from "./home/i18n";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.papanclip.hompimpa.biz.id";

export type Schema = Record<string, unknown>;

/* ------------------------------------------------------------------ */
/*  Organization                                                       */
/* ------------------------------------------------------------------ */
export function organizationSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "PapanClip",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/images/logo.png`,
      width: 512,
      height: 512,
    },
    description:
      "PapanClip adalah platform manajemen proyek dan tugas kolaboratif untuk tim agile. Menggabungkan Kanban board, sprint planning, dan kontrol akses granular dalam satu workspace.",
    foundingDate: "2025",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bandung",
      addressRegion: "West Java",
      addressCountry: "ID",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support.papanclip@gmail.com",
        availableLanguage: ["Indonesian", "English"],
      },
    ],
    sameAs: [
      siteUrl,
      "https://github.com/PapanClip",
      "https://www.linkedin.com/company/papanclip",
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  WebSite                                                            */
/* ------------------------------------------------------------------ */
export function websiteSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: "PapanClip",
    url: siteUrl,
    description:
      "Project Management & Task Management Software for Agile Teams",
    publisher: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: ["en", "id"],
  };
}

/* ------------------------------------------------------------------ */
/*  SoftwareApplication                                                */
/* ------------------------------------------------------------------ */
export function softwareApplicationSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${siteUrl}/#software`,
    name: "PapanClip",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "IDR",
      lowPrice: "0",
      highPrice: "399000",
      offerCount: "3",
      offers: [
        {
          "@type": "Offer",
          name: "Beta Testing (Free)",
          price: "0",
          priceCurrency: "IDR",
          availability: "https://schema.org/InStock",
          url: `${siteUrl}/pricing`,
        },
        {
          "@type": "Offer",
          name: "Basic",
          price: "199000",
          priceValidUntil: "2026-12-31",
          priceCurrency: "IDR",
          description: "Up to 10 members, 5 workspaces, 5GB storage",
          availability: "https://schema.org/InStock",
          url: `${siteUrl}/pricing`,
        },
        {
          "@type": "Offer",
          name: "Pro",
          price: "399000",
          priceValidUntil: "2026-12-31",
          priceCurrency: "IDR",
          description:
            "Advanced team management, permissions, priority support",
          availability: "https://schema.org/InStock",
          url: `${siteUrl}/pricing`,
        },
      ],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "50",
      bestRating: "5",
      worstRating: "1",
    },
    description:
      "PapanClip adalah platform manajemen proyek dan tugas kolaboratif untuk tim agile. Menggabungkan Kanban board, sprint planning, dan kontrol akses granular dalam satu workspace. Sebagai alternatif Jira, ClickUp, dan Trello.",
    featureList:
      "Kanban Board, Sprint Planning, RBAC (Role-Based Access Control), Client Collaboration, Multi-tenant Access, Unlimited Workspaces, Unlimited Users, Custom Roles, Activity Logs",
    publisher: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Product (Pricing page)                                             */
/* ------------------------------------------------------------------ */
export function productSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${siteUrl}/pricing/#product`,
    name: "PapanClip — Project Management Software",
    description:
      "PapanClip adalah platform manajemen proyek dan tugas kolaboratif untuk tim agile. Alternatif Jira, ClickUp, dan Trello untuk software teams.",
    brand: {
      "@type": "Brand",
      name: "PapanClip",
    },
    offers: [
      {
        "@type": "Offer",
        name: "Beta Testing",
        price: "0",
        priceCurrency: "IDR",
        availability: "https://schema.org/InStock",
        url: `${siteUrl}/pricing`,
        itemCondition: "https://schema.org/NewCondition",
      },
      {
        "@type": "Offer",
        name: "Basic Plan",
        price: "199000",
        priceCurrency: "IDR",
        availability: "https://schema.org/InStock",
        url: `${siteUrl}/pricing`,
        itemCondition: "https://schema.org/NewCondition",
        priceValidUntil: "2026-12-31",
      },
      {
        "@type": "Offer",
        name: "Pro Plan",
        price: "399000",
        priceCurrency: "IDR",
        availability: "https://schema.org/InStock",
        url: `${siteUrl}/pricing`,
        itemCondition: "https://schema.org/NewCondition",
        priceValidUntil: "2026-12-31",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "50",
      bestRating: "5",
      worstRating: "1",
    },
  };
}

/* ------------------------------------------------------------------ */
/*  BreadcrumbList                                                     */
/* ------------------------------------------------------------------ */
export function breadcrumbSchema(
  items: { name: string; path: string }[],
  locale: Locale = "en",
): Schema {
  const prefix = locale === "id" ? "/id" : "";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${prefix}${item.path}`,
    })),
  };
}

/* ------------------------------------------------------------------ */
/*  FAQPage                                                            */
/* ------------------------------------------------------------------ */
const FAQ_ITEMS: Record<Locale, { q: string; a: string }[]> = {
  en: [
    {
      q: "How do I try Papanclip for free?",
      a: "Papanclip is currently in its Beta Testing phase, so you can access and try every feature for free. Just open the Papanclip website and start using it right away — no hassle.",
    },
    {
      q: "What features does Papanclip offer?",
      a: "Papanclip provides task management, sprint boards, progress monitoring, team collaboration, AI summaries, file attachments, and many other productivity features that we keep improving based on user feedback.",
    },
    {
      q: "Can Papanclip be used for many projects and users?",
      a: "Yes. Papanclip is designed for teams and companies with a flexible number of projects and users, with no limits under normal usage.",
    },
    {
      q: "Can I use Papanclip on mobile?",
      a: "Yes. Papanclip works in the browser on both desktop and mobile, so it stays comfortable to use anywhere.",
    },
    {
      q: "Is there an upload storage limit?",
      a: "The maximum upload size per file is 50 MB. Total storage is currently unlimited for normal work usage that is not abused.",
    },
    {
      q: "How long is my data stored in Papanclip?",
      a: "As long as your Papanclip subscription is active, your company data stays safely stored. If you cancel, your data is kept for 3 months before being permanently deleted.",
    },
    {
      q: "Where can I go if I run into issues?",
      a: "You can contact the Papanclip support team via email: support.papanclip@gmail.com",
    },
    {
      q: "What hours is Papanclip support available?",
      a: "The Papanclip support team is ready to help 24 hours a day.",
    },
  ],
  id: [
    {
      q: "Gimana cara coba gratis Papanclip?",
      a: "Saat ini Papanclip masih dalam fase Beta Testing, jadi kamu bisa akses dan coba semua fitur secara gratis. Tinggal buka website Papanclip dan langsung mulai pakai tanpa ribet.",
    },
    {
      q: "Fitur apa saja yang ada di Papanclip?",
      a: "Papanclip menyediakan fitur task management, board sprint, monitoring progress, collaboration team, AI summary, attachment file, dan berbagai fitur productivity lainnya yang terus dikembangkan berdasarkan feedback user.",
    },
    {
      q: "Apakah Papanclip bisa dipakai untuk banyak project dan user?",
      a: "Bisa. Papanclip dirancang untuk kebutuhan tim dan perusahaan dengan jumlah project maupun user yang fleksibel tanpa batasan penggunaan normal.",
    },
    {
      q: "Apakah Papanclip bisa dipakai di mobile?",
      a: "Bisa. Papanclip dapat diakses melalui browser di desktop maupun mobile sehingga tetap nyaman digunakan di mana saja.",
    },
    {
      q: "Apakah ada batas upload storage?",
      a: "Maksimal ukuran upload per file adalah 50 MB. Untuk total penyimpanan saat ini masih unlimited untuk penggunaan normal pekerjaan dan tidak disalahgunakan.",
    },
    {
      q: "Sampai kapan data saya tersimpan di Papanclip?",
      a: "Selama subscription Papanclip kamu masih aktif, data perusahaan akan tetap tersimpan dengan aman. Jika berhenti berlangganan, data masih akan disimpan selama 3 bulan sebelum dihapus permanen.",
    },
    {
      q: "Kalau ada kendala bisa tanya ke mana?",
      a: "Kamu bisa hubungi tim support Papanclip via email: support.papanclip@gmail.com",
    },
    {
      q: "Support Papanclip tersedia jam berapa?",
      a: "Tim support Papanclip siap membantu 24 jam.",
    },
  ],
};

export function faqPageSchema(locale: Locale = "en"): Schema {
  const items = FAQ_ITEMS[locale];
  const url = locale === "id" ? `${siteUrl}/id/faq` : `${siteUrl}/faq`;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}/#faq`,
    name: "Frequently Asked Questions — PapanClip",
    description:
      "Pertanyaan yang sering diajukan tentang PapanClip Project Management Software",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

