import type { Metadata } from "next";
import FaqClient from "./FaqClient";

export const metadata: Metadata = {
  title: "FAQ — Project & Task Management Software",
  description:
    "Frequently asked questions about PapanClip — the project management and task management software for agile teams, sprint planning, and software development workflows.",
  alternates: {
    canonical: "/faq"
  }
};

export default function FAQPage() {
  return <FaqClient />;
}
