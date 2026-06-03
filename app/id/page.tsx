import type { Metadata } from "next";
import HomeClient from "../HomeClient";

export const metadata: Metadata = {
  title: {
    absolute:
      "PapanClip – Software Manajemen Proyek & Tugas untuk Tim Agile"
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
  }
};

export default function HomeIdPage() {
  return <HomeClient locale="id" />;
}
