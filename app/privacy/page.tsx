import type { Metadata } from "next";
import PrivacyClient from "./PrivacyClient";

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
  return <PrivacyClient />;
}
