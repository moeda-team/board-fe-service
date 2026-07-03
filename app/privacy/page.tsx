import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import PrivacyClient from "./PrivacyClient";
import { parsePrivacyPolicy } from "./parse";
import { JsonLd } from "../JsonLd";
import { breadcrumbSchema } from "../structured-data";

export const metadata: Metadata = {
  title: "Privacy Policy — PapanClip",
  description:
    "Privacy Policy for PapanClip — learn how we collect, use, disclose, and safeguard your personal information when using our task management application.",
  alternates: {
    canonical: "/privacy",
    languages: {
      en: "/privacy",
      id: "/id/privacy",
      "x-default": "/privacy"
    }
  }
};

export default function PrivacyPage() {
  const filePath = path.join(process.cwd(), "content", "privacy-policy.md");
  const markdown = fs.readFileSync(filePath, "utf8");
  const document = parsePrivacyPolicy(markdown);
  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: "Home", path: "" },
          { name: "Privacy Policy", path: "/privacy" }
        ])}
      />
      <PrivacyClient document={document} />
    </>
  );
}
