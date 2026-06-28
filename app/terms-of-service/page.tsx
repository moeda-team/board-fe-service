import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import TermsClient from "./TermsClient";
import { parseTerms } from "./parse";
import { JsonLd } from "../JsonLd";
import { breadcrumbSchema } from "../structured-data";

export const metadata: Metadata = {
  title: "Terms of Service — PapanClip",
  description:
    "Terms of Service for PapanClip — the collaborative Kanban board and project management application for agile teams. Read our terms governing the use of our platform.",
  alternates: {
    canonical: "/terms-of-service",
    languages: {
      en: "/terms-of-service",
      id: "/id/terms-of-service",
      "x-default": "/terms-of-service"
    }
  }
};

export default function TermsPage() {
  const filePath = path.join(process.cwd(), "content", "terms-of-service.md");
  const markdown = fs.readFileSync(filePath, "utf8");
  const document = parseTerms(markdown);
  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: "Home", path: "" },
          { name: "Terms of Service", path: "/terms-of-service" }
        ])}
      />
      <TermsClient document={document} />
    </>
  );
}
