import type { Metadata } from "next";
import ChangelogClient from "../../changelog/ChangelogClient";

export const metadata: Metadata = {
  title: "Changelog — PapanClip",
  description:
    "Tetap up to date dengan fitur terbaru dan peningkatan yang telah kami rilis untuk PapanClip — software manajemen proyek dan tugas.",
  alternates: {
    canonical: "/id/changelog",
    languages: {
      en: "/changelog",
      id: "/id/changelog",
      "x-default": "/changelog"
    }
  }
};

export default function ChangelogIdPage() {
  return <ChangelogClient locale="id" />;
}
