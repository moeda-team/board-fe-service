import type { Metadata } from "next";
import ChangelogClient from "./ChangelogClient";

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
  return <ChangelogClient />;
}
