import type { Metadata } from "next";
import HomeClient from "../HomeClient";
import { JsonLd } from "../JsonLd";
import { organizationSchema, websiteSchema } from "../structured-data";

export const metadata: Metadata = {
  title: {
    absolute: "PapanClip – Software Manajemen Proyek & Tugas untuk Tim Agile"
  },
  description:
    "PapanClip adalah software manajemen proyek dan tugas untuk tim agile. Kelola proyek, tugas, sprint, dan workflow pengembangan software dalam satu platform — rencanakan, lacak, dan selesaikan proyek lebih cepat.",
  alternates: {
    canonical: "/id",
    languages: {
      en: "/",
      id: "/id",
      "x-default": "/"
    }
  },
  keywords: [
    "project management tool Indonesia",
    "software manajemen proyek",
    "aplikasi manajemen tugas gratis",
    "aplikasi project management",
    "kanban online",
    "manajemen proyek terbaik",
    "software project management buatan Indonesia",
    "alternatif trello yang lebih lengkap",
    "tool project management harga terjangkau",
    "PapanClip"
  ]
};

export default function HomeIdPage() {
  return (
    <>
      <JsonLd schema={[organizationSchema(), websiteSchema()]} />
      <HomeClient locale="id" />
    </>
  );
}
