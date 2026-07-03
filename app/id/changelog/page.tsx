import type { Metadata } from "next";
import ChangelogClient from "../../changelog/ChangelogClient";
import { JsonLd } from "../../JsonLd";
import { breadcrumbSchema } from "../../structured-data";

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
  return (
    <>
      <JsonLd
        schema={breadcrumbSchema(
          [
            { name: "Home", path: "" },
            { name: "Changelog", path: "/changelog" }
          ],
          "id"
        )}
      />
      <ChangelogClient locale="id" />
    </>
  );
}
