"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  HelpCircle,
  Loader2,
  Users,
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGetMyLatestEnterpriseRequest, useGetCustomPendingInvoice } from "@/hooks/api/useEnterpriseRequests";
import type { EnterpriseRequest, EnterpriseRequestStatus } from "@/types/enterprise";

const STATUS_ORDER: EnterpriseRequestStatus[] = [
  "REQUIREMENT_REVIEW",
  "DISCOVERY_MEETING",
  "CONTRACT_ONBOARDING",
  "COMPLETED",
];

const STEPS = [
  {
    status: "REQUIREMENT_REVIEW" as const,
    title: "Requirement Review",
    description:
      "We review your requirements and align them with the right solution.",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    status: "DISCOVERY_MEETING" as const,
    title: "Discovery Meeting",
    description:
      "Our solutions team will schedule a call to understand your goals in detail.",
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    status: "CONTRACT_ONBOARDING" as const,
    title: "Contract & Onboarding",
    description:
      "Finalize the agreement and kick off a smooth onboarding experience.",
    icon: <Users className="w-5 h-5" />,
  },
  {
    status: "COMPLETED" as const,
    title: "Completed",
    description: "Onboarding complete. Welcome aboard!",
    icon: <Check className="w-5 h-5" />,
  },
];

const FAQ = [
  {
    icon: <Clock className="w-4 h-4 text-gray-500" />,
    title: "How long does the process take?",
    body: "Most organisations receive a proposal within 1–2 business days.",
  },
  {
    icon: <FileText className="w-4 h-4 text-gray-500" />,
    title: "Can I modify my request?",
    body:
      "Yes, our team can update your requirements at any time before the proposal.",
  },
  {
    icon: <Users className="w-4 h-4 text-gray-500" />,
    title: "Who will contact me?",
    body:
      "A solutions consultant will contact you from our team within 24 hours.",
  },
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
  const isCanceled = status === "CANCELED";
  const isCompleted = status === "COMPLETED";
  const statusIndex = status ? STATUS_ORDER.indexOf(status) : -1;

  if (isCanceled) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start gap-3 text-red-600">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Request Canceled</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Your enterprise request has been canceled. If you have questions,
              please contact us at{" "}
              <a
                href="mailto:sales@papanclip.com"
                className="text-blue-600 hover:underline"
              >
                sales@papanclip.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="relative">
        {STEPS.map((step, idx) => {
          const isCompletedStep = statusIndex > idx;
          const isCurrent = !isCompleted && statusIndex === idx;
          const isFinalCompleted = isCompleted && idx === STEPS.length - 1;

          return (
            <div key={step.status} className="flex gap-4 mb-6 last:mb-0">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                    isCompletedStep || isFinalCompleted
                      ? "bg-green-500"
                      : isCurrent
                        ? "bg-blue-600"
                        : "bg-gray-200"
                  }`}
                >
                  {isCompletedStep || isFinalCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gray-200 my-1" />
                )}
              </div>
              <div className="flex-1 pb-6 last:pb-0">
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
                      isCompletedStep || isFinalCompleted
                        ? "bg-green-100 text-green-700"
                        : isCurrent
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {isCompletedStep || isFinalCompleted
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

function MeetingCard({ request }: { request: EnterpriseRequest }) {
  const meetingDate = request.meetingDate
    ? new Date(request.meetingDate).toLocaleString("en-GB", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      })
    : null;

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-semibold">
          <Video className="w-4 h-4" />
          Discovery Meeting Details
        </div>

        <div className="space-y-3">
          {meetingDate && (
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Date & Time</p>
                <p className="text-sm font-medium">{meetingDate}</p>
              </div>
            </div>
          )}

          {request.meetingPlatform && (
            <div className="flex items-start gap-3">
              <Video className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Platform</p>
                <p className="text-sm font-medium">{request.meetingPlatform}</p>
              </div>
            </div>
          )}

          {request.meetingLink && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open(request.meetingLink!, "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Join Meeting
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
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

function getHeading(status?: EnterpriseRequestStatus) {
  if (!status) return "No Enterprise Request Found";
  if (status === "COMPLETED") return "Enterprise Onboarding Complete!";
  if (status === "CANCELED") return "Enterprise Request Canceled";
  if (status === "DISCOVERY_MEETING") return "Discovery Meeting Scheduled";
  if (status === "CONTRACT_ONBOARDING") return "Contract & Onboarding";
  return "Your Enterprise Request Has Been Submitted";
}

function getSubheading(status?: EnterpriseRequestStatus) {
  if (!status) return "You haven't submitted an enterprise request yet.";
  if (status === "COMPLETED")
    return "Welcome aboard! Your enterprise plan is now active.";
  if (status === "CANCELED")
    return "If you have questions, please contact our sales team.";
  if (status === "DISCOVERY_MEETING")
    return "Your discovery meeting has been scheduled. Join using the link below.";
  if (status === "CONTRACT_ONBOARDING")
    return "Your contract is being finalized. Our team will reach out with next steps.";
  return "Our solutions team will review your requirements and contact you within 24 hours.";
}

function getCtaButtons(
  status?: EnterpriseRequestStatus,
  meetingLink?: string | null,
  paymentUrl?: string | null,
  onPayNow?: () => void,
  isLoadingPayment?: boolean
) {
  const buttons: React.ReactNode[] = [];

  if (status === "REQUIREMENT_REVIEW") {
    buttons.push(
      <Button
        key="schedule"
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
    );
  }

  if (status === "DISCOVERY_MEETING" && meetingLink) {
    buttons.push(
      <Button
        key="join"
        className="h-12 flex-1 bg-blue-600 hover:bg-blue-700 text-white justify-center gap-2"
        onClick={() => window.open(meetingLink, "_blank")}
      >
        <Video className="w-4 h-4" />
        Join Meeting
      </Button>
    );
  }

  if (status === "CONTRACT_ONBOARDING") {
    if (paymentUrl) {
      buttons.push(
        <Button
          key="pay"
          className="h-12 flex-1 bg-green-600 hover:bg-green-700 text-white justify-center gap-2"
          onClick={onPayNow}
          disabled={isLoadingPayment}
        >
          {isLoadingPayment ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CreditCard className="w-4 h-4" />
          )}
          Pay Now
        </Button>
      );
    } else if (!isLoadingPayment) {
      buttons.push(
        <Button
          key="contact"
          className="h-12 flex-1 bg-blue-600 hover:bg-blue-700 text-white justify-center gap-2"
          onClick={() => window.open("mailto:sales@papanclip.com", "_blank")}
        >
          <HelpCircle className="w-4 h-4" />
          Contact Sales
        </Button>
      );
    }
  }

  if (status === "COMPLETED") {
    buttons.push(
      <Button
        key="dashboard"
        variant="outline"
        className="h-12 flex-1 justify-center gap-2"
        onClick={() => (window.location.href = "/spaces")}
      >
        <ArrowLeft className="w-4 h-4" />
        Go to Dashboard
      </Button>
    );
  }

  if (status !== "COMPLETED") {
    buttons.push(
      <Button
        key="back"
        variant="outline"
        className="h-12 flex-1 justify-center gap-2"
        onClick={() => (window.location.href = "/spaces")}
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Dashboard
      </Button>
    );
  }

  return buttons;
}

export default function SubmittedClient() {
  const { data: session } = useSession();
  const { data: latestRequest, isLoading: isLoadingActive } =
    useGetMyLatestEnterpriseRequest(session);
  const { data: pendingInvoice, isLoading: isLoadingPayment } =
    useGetCustomPendingInvoice(latestRequest?.tenantId, session);

  const status = latestRequest?.status;
  const paymentUrl = pendingInvoice?.paymentUrl ?? null;

  const handlePayNow = () => {
    if (paymentUrl) {
      window.open(paymentUrl, "_blank");
    }
  };

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
        {isLoadingActive ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <>
            <HeroIllustration />

            <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
              {getHeading(status)}
            </h1>
            <p className="text-center text-gray-500 mb-6">
              {getSubheading(status)}
            </p>

            <StatusTimeline request={latestRequest ?? undefined} />

            {status === "DISCOVERY_MEETING" && latestRequest?.meetingDate && (
              <div className="mt-4">
                <MeetingCard request={latestRequest} />
              </div>
            )}

            <div className="mt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                {getCtaButtons(
                  status,
                  latestRequest?.meetingLink,
                  paymentUrl,
                  handlePayNow,
                  isLoadingPayment
                )}
              </div>
            </div>

            {status === "REQUIREMENT_REVIEW" && <FaqAccordion />}

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
          </>
        )}
      </main>
    </div>
  );
}
