import type { Metadata } from "next";
import ContactClient from "./ContactClient";
import { JsonLd } from "../JsonLd";
import { breadcrumbSchema } from "../structured-data";

export const metadata: Metadata = {
  title: "Contact — PapanClip",
  description:
    "Get in touch with the PapanClip team. Contact us for support, questions, feedback, or inquiries about our project management and Kanban board software.",
  alternates: {
    canonical: "/contact",
    languages: {
      en: "/contact",
      id: "/id/contact",
      "x-default": "/contact"
    }
  }
};

export default function ContactPage() {
  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: "Home", path: "" },
          { name: "Contact", path: "/contact" }
        ])}
      />
      <ContactClient />
    </>
  );
}
