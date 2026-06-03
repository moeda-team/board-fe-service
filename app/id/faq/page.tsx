import type { Metadata } from "next";
import FaqClient from "../../faq/FaqClient";

export const metadata: Metadata = {
  title: "FAQ — Software Manajemen Proyek & Tugas",
  description:
    "Pertanyaan yang sering diajukan tentang PapanClip — software manajemen proyek dan tugas untuk tim agile, perencanaan sprint, dan workflow pengembangan software.",
  alternates: {
    canonical: "/id/faq",
    languages: {
      en: "/faq",
      id: "/id/faq",
      "x-default": "/faq"
    }
  }
};

export default function FaqIdPage() {
  return <FaqClient locale="id" />;
}
