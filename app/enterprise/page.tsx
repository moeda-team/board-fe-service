import type { Metadata } from "next";
import { Suspense } from "react";
import EnterpriseClient from "./EnterpriseClient";

export const metadata: Metadata = {
  title: "Enterprise Onboarding — Request a Custom Proposal",
  description:
    "Configure your enterprise plan and request a tailored proposal from our sales team.",
  robots: {
    index: false,
    follow: false
  }
};

export default function EnterprisePage() {
  return (
    <Suspense fallback={null}>
      <EnterpriseClient />
    </Suspense>
  );
}
