import type { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing — Project & Task Management Software",
  description:
    "PapanClip pricing plans for project management and task management software. Choose the plan that fits your agile team and start planning sprints, tracking tasks, and shipping faster.",
  alternates: {
    canonical: "/pricing",
    languages: {
      en: "/pricing",
      id: "/id/pricing",
      "x-default": "/pricing"
    }
  }
};

export default function PricingPage() {
  return <PricingClient />;
}
