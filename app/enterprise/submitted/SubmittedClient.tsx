"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  FileText,
  HelpCircle,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEnterpriseRequests } from "@/hooks/api/useEnterpriseRequests";
import type {
  EnterpriseRequest,
  EnterpriseRequestStatus
} from "@/types/enterprise";

const STATUS_ORDER: EnterpriseRequestStatus[] = [
  "REQUIREMENT_REVIEW",
  "DISCOVERY_MEETING",
  "CONTRACT_ONBOARDING",
  "COMPLETED"
];

const STEPS = [
  {
    status: "REQUIREMENT_REVIEW" as const,
    title: "Requirement Review",
    description:
      "We review your requirements and align them with the right solution.",
    icon: <FileText className="w-5 h-5" />
  },
  {
    status: "DISCOVERY_MEETING" as const,
    title: "Discovery Meeting",
    description:
      "Our solutions team will schedule a call to understand your goals in detail.",
    icon: <Calendar className="w-5 h-5" />
  },
  {
    status: "CONTRACT_ONBOARDING" as const,
    title: "Contract & Onboarding",
    description:
      "Finalize the agreement and kick off a smooth onboarding experience.",
    icon: <Users className="w-5 h-5" />
  }
];

const FAQ = [
  {
    icon: <Clock className="w-4 h-4 text-gray-500" />,
    title: "How long does the process take?",
    body: "Most organisations receive a proposal within 1–2 business days."
  },
  {
    icon: <FileText className="w-4 h-4 text-gray-500" />,
    title: "Can I modify my request?",
    body:
      "Yes, our team can update your requirements at any time before the proposal."
  },
  {
    icon: <Users className="w-4 h-4 text-gray-500" />,
    title: "Who will contact me?",
    body:
      "A solutions consultant will contact you from our team within 24 hours."
  }
];

function HeroIllustration() {
  return (
    <div className="relative mx-auto mb-8 w-72 h-44">
      <div className="absolute inset-0 flex items-end justify-center">
        <svg
          viewBox="0 0 400 200"
          className="w-full h-full fill-current text-blue-100"
        >
          <rect x="60" y="110" width="50" height="90" className="text-blue-200" />
          <rect x="120" y="80" width="70" height="120" className="text-blue-300" />
          <rect x="200" y="60" width="80" height="140" className="text-blue-400" />
          <rect x="290" y="100" width="60" height="100" className="text-blue-300" />
          <rect x="10" y="130" width="40" height="70" className="text-blue-200" />
        </svg>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-green-50 border-4 border-white shadow-lg flex items-center justify-center">
          <Check
            className="w-10 h-10 text-green-500"
            strokeWidth={3}
          />
        </div>
      </div>
    </div>
  );
}

function StatusTimeline({ request }: { request?: EnterpriseRequest }) {
  const status = request?.status;
  const statusIndex = status ? STATUS_ORDER.indexOf(status) : -1;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="relative">
        {STEPS.map((step, idx) => {
          const isCompleted = statusIndex > idx;
          const isCurrent = statusIndex === idx;
          const isUpcoming = statusIndex < idx;

          return (
            <div key={step.status} className="flex gap-4 mb-6 last:mb-0">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                    isCompleted
                      ? "bg-green-500"
                      : isCurrent
                        ? "bg-blue-600"
                        : "bg-gray-200"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gray-200 my-1" />
                )}
              </div>
              <div className="flex-1 pb-6">
                <div className="flex items-center justify-between mb-0.5">
                  <h3
                    className={`text-sm font-semibold ${
                      isCurrent ? "text-gray-900" : "text-gray-700"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      isCompleted
                        ? "bg-green-100 text-green-700"
                        : isCurrent
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {isCompleted
                      ? "Completed"
                      : isCurrent
                        ? "In Progress"
                        : "Upcoming"}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mt-10">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Frequently Asked Questions
      </h3>
      <div className="space-y-3">
        {FAQ.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <button
              type="button"
              className="w-full flex items-center justify-between p-4 text-left"
              onClick={() => setOpen(open === idx ? null : idx)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {item.title}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  open === idx ? "rotate-180" : ""
                }`}
              />
            </button>
            {open === idx && (
              <div className="px-4 pb-4 text-sm text-gray-500">{item.body}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SubmittedClient() {
  const router = useRouter();
  const { data: requests } = useEnterpriseRequests({ limit: 1 });
  const request = requests?.items?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-gray-900">Papanclip</span>
            </div>
            <span className="h-5 w-px bg-gray-200" />
            <span className="text-sm text-gray-500 hidden sm:inline">
              Enterprise Subscription
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/contact"
              className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
            >
              <HelpCircle className="w-4 h-4" />
              Need help?
            </a>
            <a
              href="mailto:sales@papanclip.com"
              className="text-sm font-medium border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <HeroIllustration />

        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
          Your Enterprise Request Has Been Submitted
        </h1>
        <p className="text-center text-gray-500 mb-10">
          Our solutions team will review your requirements and contact you
          within 24 hours.
        </p>

        <StatusTimeline request={request} />

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            className="h-12 flex-1 bg-blue-600 hover:bg-blue-700 text-white justify-center gap-2"
            onClick={() =>
              window.open(
                "mailto:sales@papanclip.com?subject=Schedule%20Discovery%20Call",
                "_blank"
              )
            }
          >
            <Calendar className="w-4 h-4" />
            Schedule Discovery Call
          </Button>
          <Button
            variant="outline"
            className="h-12 flex-1 justify-center gap-2"
            onClick={() => router.push("/spaces")}
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </Button>
        </div>

        <FaqAccordion />

        <p className="text-center text-sm text-gray-500 mt-8">
          Need immediate assistance?{" "}
          <a
            href="mailto:sales@papanclip.com"
            className="text-blue-600 font-medium hover:underline"
          >
            Contact our sales team
          </a>
          .
        </p>
      </main>
    </div>
  );
}
