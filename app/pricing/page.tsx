import type { Metadata } from "next";
import PricingClient from "./PricingClient";
import { JsonLd } from "../JsonLd";
import {
  softwareApplicationSchema,
  productSchema,
  breadcrumbSchema
} from "../structured-data";

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
  },
  keywords: [
    "aplikasi manajemen tugas gratis",
    "tool project management harga terjangkau",
    "project management gratis",
    "software manajemen proyek",
    "pricing PapanClip"
  ]
};

export default function PricingPage() {
  return (
    <>
      <JsonLd
        schema={[
          softwareApplicationSchema(),
          productSchema(),
          breadcrumbSchema([
            { name: "Home", path: "" },
            { name: "Pricing", path: "/pricing" }
          ])
        ]}
      />
      <PricingClient />
    </>
  );
}
