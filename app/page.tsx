import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { JsonLd } from "./JsonLd";
import { organizationSchema, websiteSchema } from "./structured-data";

export const metadata: Metadata = {
  title: {
    absolute:
      "PapanClip – Project Management & Task Management Software for Agile Teams"
  },
  description:
    "PapanClip is a project management tool built for teams in Indonesia. Manage projects, tasks, sprints, and workflows with Kanban boards, RBAC, and real-time collaboration. Try it free.",
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      id: "/id",
      "x-default": "/"
    }
  },
  keywords: [
    "project management tool Indonesia",
    "software manajemen proyek",
    "task management software",
    "aplikasi project management",
    "kanban online",
    "project management gratis",
    "software project management buatan Indonesia",
    "alternatif trello",
    "alternatif jira",
    "PapanClip"
  ]
};

export default function Home() {
  return (
    <>
      <JsonLd schema={[organizationSchema(), websiteSchema()]} />
      <HomeClient />
    </>
  );
}
