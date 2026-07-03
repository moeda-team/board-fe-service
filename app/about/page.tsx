import type { Metadata } from "next";
import AboutClient from "./AboutClient";
import { JsonLd } from "../JsonLd";
import { breadcrumbSchema } from "../structured-data";

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
  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: "Home", path: "" },
          { name: "About", path: "/about" }
        ])}
      />
      <AboutClient />
    </>
  );
}
