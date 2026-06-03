import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: {
    absolute:
      "PapanClip – Project Management & Task Management Software for Agile Teams"
  },
  description:
    "Manage projects, tasks, sprints, teams, and software development workflows in one platform. PapanClip helps teams plan, track, and deliver projects faster.",
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      id: "/id",
      "x-default": "/"
    }
  }
};

export default function Home() {
  return <HomeClient />;
}
