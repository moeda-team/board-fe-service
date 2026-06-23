import type { Metadata } from "next";
import { Suspense } from "react";
import PaymentClient from "./PaymentClient";

export const metadata: Metadata = {
  title: "Payment — Complete Your Purchase",
  description: "Secure payment processing for your Pro plan subscription.",
  robots: {
    index: false,
    follow: false
  }
};

export default function PaymentPage() {
  return (
    <Suspense fallback={null}>
      <PaymentClient />
    </Suspense>
  );
}
