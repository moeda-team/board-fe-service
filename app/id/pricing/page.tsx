import type { Metadata } from "next";
import PricingClient from "../../pricing/PricingClient";

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
  }
};

export default function PricingIdPage() {
  return <PricingClient locale="id" />;
}
