"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Shield,
  Lock,
  Check,
  ChevronRight,
  Loader2
} from "lucide-react";
import { gooeyToast } from "goey-toast";
import {
  useCreateCheckout,
  useCancelPendingPayment,
  useMidtransSnap,
  usePendingPayment,
  usePlans
} from "@/hooks/api/usePayments";
import { useAuthMe } from "@/hooks/api/useAuth";
import { getActiveTenantId } from "@/lib/tenant";

// Payment methods (Indonesia focused for Midtrans)
const PAYMENT_METHODS = [
  {
    id: "card",
    name: "Credit / Debit Card",
    icons: ["/visa.svg", "/mastercard.svg", "/amex.svg"],
    enabled: true
  },
  {
    id: "gopay",
    name: "GoPay",
    icon: "/gopay.svg",
    enabled: true
  },
  {
    id: "ovo",
    name: "OVO",
    icon: "/ovo.svg",
    enabled: true
  },
  {
    id: "dana",
    name: "DANA",
    icon: "/dana.svg",
    enabled: true
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer (Virtual Account)",
    icon: "/va.svg",
    enabled: true
  }
];

export default function PaymentClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan") || "pro";

  const { data: plans, isLoading: isPlansLoading } = usePlans();
  const selectedPlan =
    plans?.find((p) => p.tier.toLowerCase() === planId.toLowerCase()) ??
    plans?.find((p) => p.tier !== "FREE");

  const { data: authMe } = useAuthMe();
  const user = authMe?.user;
  const tenantId = getActiveTenantId(authMe);
  const { mutateAsync: createCheckout, isPending: isCreatingCheckout } =
    useCreateCheckout();
  const { mutate: cancelPendingPayment, isPending: isCancelling } =
    useCancelPendingPayment();
  const { data: pendingPayment, isLoading: isPendingLoading } =
    usePendingPayment(tenantId || "");
  const { loadSnapScript, openSnapPopup } = useMidtransSnap();

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [saveCard, setSaveCard] = useState(false);

  // Load Midtrans Snap script on mount
  useEffect(() => {
    loadSnapScript().catch(() => {
      gooeyToast.error("Failed to load payment system");
    });
  }, [loadSnapScript]);

  const total = selectedPlan ? selectedPlan.basePrice : 0;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!tenantId && authMe) {
      gooeyToast.error("Please select a tenant first");
      router.push("/spaces");
    }
  }, [tenantId, authMe, router]);

  const handleContinuePending = () => {
    if (!pendingPayment) return;
    try {
      openSnapPopup(pendingPayment.snapToken, {
        onSuccess: () => {
          gooeyToast.success("Payment successful!");
          setStep(3);
        },
        onPending: () => {
          gooeyToast.info("Payment is pending.");
        },
        onError: () => {
          gooeyToast.error("Payment failed.");
        },
        onClose: () => {
          gooeyToast.info("Payment window closed");
        }
      });
    } catch {
      if (pendingPayment.snapRedirectUrl) {
        window.location.href = pendingPayment.snapRedirectUrl;
      } else {
        gooeyToast.error("Unable to open payment window.");
      }
    }
  };

  const handleCancelPending = () => {
    if (!tenantId) return;
    cancelPendingPayment(tenantId, {
      onSuccess: () => {
        gooeyToast.success("Pending payment cancelled");
      },
      onError: () => {
        gooeyToast.error("Failed to cancel payment");
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenantId) {
      gooeyToast.error("Please login first");
      return;
    }

    try {
      if (
        !selectedPlan ||
        selectedPlan.tier === "FREE" ||
        selectedPlan.tier === "CUSTOM"
      ) {
        gooeyToast.error(
          selectedPlan?.tier === "CUSTOM"
            ? "Custom plan requires sales negotiation. Please contact support."
            : "Invalid plan selected"
        );
        return;
      }
      // Create checkout session via backend API
      const checkout = await createCheckout({
        tenantId,
        tierToUpgrade: selectedPlan.tier as "BASIC" | "PRO"
      });

      gooeyToast.success("Redirecting to payment...");

      try {
        // Open Midtrans Snap popup with the token from backend
        openSnapPopup(checkout.token, {
          onSuccess: () => {
            gooeyToast.success("Payment successful!");
            setStep(3); // Go to confirmation step
          },
          onPending: () => {
            gooeyToast.info(
              "Payment is pending. Please complete your payment."
            );
          },
          onError: () => {
            gooeyToast.error("Payment failed. Please try again.");
          },
          onClose: () => {
            // User closed the popup
            gooeyToast.info("Payment window closed");
          }
        });
      } catch {
        // Snap not loaded — fall back to the hosted redirect URL
        if (checkout.redirect_url) {
          window.location.href = checkout.redirect_url;
        } else {
          gooeyToast.error("Unable to open payment window. Please try again.");
        }
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Payment initiation failed. Please try again.";
      gooeyToast.error(msg);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    }
    return v;
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-semibold text-lg">PapanClip</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-4">
            <div
              className={`flex items-center gap-2 ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                1
              </div>
              <span className="text-sm font-medium">Choose Plan</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <div
              className={`flex items-center gap-2 ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                2
              </div>
              <span className="text-sm font-medium">Payment</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <div
              className={`flex items-center gap-2 ${step >= 3 ? "text-blue-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                3
              </div>
              <span className="text-sm font-medium">Confirmation</span>
            </div>
          </div>
        </div>

        {step === 3 ? (
          /* Confirmation Step */
          <div className="max-w-md mx-auto">
            <Card className="text-center py-12">
              <CardContent className="space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-2">
                    Payment Successful!
                  </h2>
                  <p className="text-gray-500">
                    Thank you for subscribing to the{" "}
                    {selectedPlan?.name ?? "Pro Plan"}.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-medium">ORD-{Date.now()}</p>
                </div>
                <div className="space-y-2">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => router.push("/spaces")}
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/settings")}
                  >
                    View Billing Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : isPlansLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
          </div>
        ) : isPendingLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
          </div>
        ) : pendingPayment ? (
          /* Pending Payment Exists */
          <div className="max-w-lg mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Pending Payment</CardTitle>
                <p className="text-sm text-muted-foreground">
                  You already have a pending payment for this tenant
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-700 font-bold text-xs">
                      PRO
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {pendingPayment.snapshotPlan?.name ?? "Pro Plan"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {pendingPayment.tierToUpgrade}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-yellow-600 border-yellow-600 bg-yellow-50"
                  >
                    {pendingPayment.status}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Order ID</span>
                    <span className="font-mono">{pendingPayment.orderId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0
                      }).format(pendingPayment.grossAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Created</span>
                    <span>
                      {new Date(pendingPayment.createdAt).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        }
                      )}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 h-11"
                    onClick={handleContinuePending}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Continue Payment
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-11 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={handleCancelPending}
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      "Cancel Payment"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid lg:grid-cols-1 gap-8 max-w-xl mx-auto">
            {/* Left Column - Payment Form */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Payment Details</CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Your payment information is secure and encrypted
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email */}
                    <div className="space-y-2">
                      <Label>Email address</Label>
                      <div className="flex items-center gap-2 rounded-md border border-input bg-muted/50 px-3 py-2 text-sm">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="shrink-0"
                        >
                          <rect
                            x="1"
                            y="3"
                            width="14"
                            height="10"
                            rx="1"
                            stroke="#9CA3AF"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M1 5L8 9L15 5"
                            stroke="#9CA3AF"
                            strokeWidth="1.5"
                          />
                        </svg>
                        <span className="truncate font-medium text-foreground">
                          {user?.email ?? "—"}
                        </span>
                      </div>
                    </div>

                    {/* Payment Method Selection */}
                    {/* <div className="space-y-3">
                      <Label>Payment Method</Label>
                      <div className="space-y-2">
                        {PAYMENT_METHODS.map((method) => (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() =>
                              method.enabled && setPaymentMethod(method.id)
                            }
                            className={`w-full flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors text-left ${
                              paymentMethod === method.id
                                ? "border-blue-600 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            } ${!method.enabled ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={!method.enabled}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  paymentMethod === method.id
                                    ? "border-blue-600"
                                    : "border-gray-300"
                                }`}
                              >
                                {paymentMethod === method.id && (
                                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                                )}
                              </div>
                              <span className="font-medium">{method.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {method.icons ? (
                                <div className="flex items-center gap-1">
                                  <div className="w-8 h-5 bg-blue-900 rounded flex items-center justify-center text-[8px] text-white font-bold">
                                    VISA
                                  </div>
                                  <div className="w-8 h-5 bg-linear-to-r from-red-500 to-orange-500 rounded flex items-center justify-center">
                                    <div className="w-4 h-4 bg-white/20 rounded-full" />
                                  </div>
                                </div>
                              ) : (
                                <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center text-[8px] font-bold text-gray-600">
                                  {method.id.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div> */}

                    {/* Card Details (only show for card payment) */}
                    {/* {paymentMethod === "card" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <div className="relative">
                            <Input
                              id="cardNumber"
                              placeholder="1234 1234 1234 1234"
                              value={cardNumber}
                              onChange={(e) =>
                                setCardNumber(formatCardNumber(e.target.value))
                              }
                              className="pl-10"
                              maxLength={19}
                              required
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                              <CreditCard className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <div className="w-6 h-4 bg-gray-200 rounded" />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input
                              id="expiry"
                              placeholder="MM / YY"
                              value={expiryDate}
                              onChange={(e) =>
                                setExpiryDate(formatExpiryDate(e.target.value))
                              }
                              maxLength={5}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvc">CVC</Label>
                            <div className="relative">
                              <Input
                                id="cvc"
                                placeholder="CVC"
                                value={cvc}
                                onChange={(e) =>
                                  setCvc(
                                    e.target.value
                                      .replace(/\D/g, "")
                                      .slice(0, 4)
                                  )
                                }
                                maxLength={4}
                                required
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Lock className="w-4 h-4 text-gray-400" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cardholder">Cardholder Name</Label>
                          <Input
                            id="cardholder"
                            placeholder="Name on card"
                            value={cardholderName}
                            onChange={(e) => setCardholderName(e.target.value)}
                            required
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="saveCard"
                            checked={saveCard}
                            onCheckedChange={(checked) =>
                              setSaveCard(checked as boolean)
                            }
                          />
                          <Label
                            htmlFor="saveCard"
                            className="text-sm cursor-pointer"
                          >
                            Save card for future payments
                          </Label>
                        </div>
                      </div>
                    )} */}

                    {/* Pay Button */}
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base"
                      disabled={isCreatingCheckout}
                    >
                      {isCreatingCheckout ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Pay Now
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-gray-500">
                      By continuing, you agree to our{" "}
                      <a href="#" className="text-blue-600 hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </a>
                    </p>
                  </form>

                  {/* Security Footer */}
                  <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      <span>Secure payments</span>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <span>Powered by Midtrans</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
