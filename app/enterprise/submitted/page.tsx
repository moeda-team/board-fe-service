import type { Metadata } from "next";
import SubmittedClient from "./SubmittedClient";

export const metadata: Metadata = {
  title: "Your Enterprise Request Has Been Submitted",
  description:
    "Thank you for your enterprise request. Our solutions team will review your requirements and contact you within 24 hours.",
  robots: {
    index: false,
    follow: false
  }
};

export default function SubmittedPage() {
  return <SubmittedClient />;
}
