import type { Metadata } from "next";
import PricingClient from "../../pricing/PricingClient";
import { JsonLd } from "../../JsonLd";
import {
  softwareApplicationSchema,
  productSchema,
  breadcrumbSchema
} from "../../structured-data";

export const metadata: Metadata = {
  title: "Harga — Software Manajemen Proyek & Tugas",
  description:
    "Paket harga PapanClip untuk software manajemen proyek dan tugas. Pilih paket yang sesuai untuk tim agile Anda dan mulai merencanakan sprint, melacak tugas, serta merilis lebih cepat.",
  alternates: {
    canonical: "/id/pricing",
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
    "harga PapanClip"
  ]
};

export default function PricingIdPage() {
  return (
    <>
      <JsonLd
        schema={[
          softwareApplicationSchema(),
          productSchema(),
          breadcrumbSchema(
            [
              { name: "Home", path: "" },
              { name: "Harga", path: "/pricing" }
            ],
            "id"
          )
        ]}
      />
      <PricingClient locale="id" />
    </>
  );
}
