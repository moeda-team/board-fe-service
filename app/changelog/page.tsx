import type { Metadata } from "next";
import ChangelogClient from "./ChangelogClient";
import { JsonLd } from "../JsonLd";
import { breadcrumbSchema } from "../structured-data";

export const metadata: Metadata = {
  title: "Changelog — PapanClip",
  description:
    "Stay up to date with the latest new features and improvements we've shipped for PapanClip — project management and task management software.",
  alternates: {
    canonical: "/changelog",
    languages: {
      en: "/changelog",
      id: "/id/changelog",
      "x-default": "/changelog"
    }
  }
};

export default function ChangelogPage() {
  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: "Home", path: "" },
          { name: "Changelog", path: "/changelog" }
        ])}
      />
      <ChangelogClient />
    </>
  );
}
