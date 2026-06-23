import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About — PapanClip",
  description:
    "Learn about PapanClip — a collaborative Kanban board and project management platform built for agile teams. Discover our mission, values, and the team behind the product.",
  alternates: {
    canonical: "/about",
    languages: {
      en: "/about",
      id: "/id/about",
      "x-default": "/about"
    }
  }
};

export default function AboutPage() {
  return <AboutClient />;
}
