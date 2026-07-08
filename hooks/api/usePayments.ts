import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiData } from "@/types/api";
import {
  CheckoutRequest,
  CheckoutResponse,
  PaymentHistoryParams,
  PaymentHistoryResponse,
  PaymentTransaction,
  Plan,
  CurrentPlanResponse,
  CustomPaymentHistoryResponse,
  CustomInvoiceRequest,
  CustomInvoiceResponse,
  CheckoutEnvelope,
  PaymentHistoryEnvelope,
  CustomPaymentHistoryEnvelope,
  PendingPaymentEnvelope,
  CancelPaymentEnvelope,
  PlansEnvelope,
  CurrentPlanEnvelope,
  CancelRenewalEnvelope,
  CustomInvoiceEnvelope,
} from "@/types/payments";

// Query keys
export const paymentsQueryKey = (tenantId: string) =>
  ["payments", "history", tenantId] as const;
export const pendingPaymentQueryKey = (tenantId: string) =>
  ["payments", "pending", tenantId] as const;
export const customHistoryQueryKey = (tenantId: string) =>
  ["payments", "custom", "history", tenantId] as const;
export const customPendingQueryKey = (tenantId: string) =>
  ["payments", "custom", "pending", tenantId] as const;
export const currentPlanQueryKey = (tenantId: string) =>
  ["payments", "current-plan", tenantId] as const;

// ─── Queries ──────────────────────────────────────────────────────────────────

export const usePlans = () =>
  useQuery({
    queryKey: ["plans"],
    queryFn: async (): Promise<Plan[]> => {
      const { data } = await apiClient.get<PlansEnvelope>("/api/plans");
      return unwrapApiData(data);
    },
  });

// Current plan & subscription state for a tenant
export const useCurrentPlan = (tenantId: string) =>
  useQuery({
    queryKey: currentPlanQueryKey(tenantId),
    queryFn: async (): Promise<CurrentPlanResponse> => {
      const { data } = await apiClient.get<CurrentPlanEnvelope>(
        "/api/payments/current-plan",
        { params: { tenantId } }
      );
      return unwrapApiData(data);
    },
    enabled:
      !!tenantId &&
      tenantId !== "undefined" &&
      tenantId !== "null",
  });

// Regular (BASIC / PRO) paginated payment history
export const usePaymentHistory = (params: PaymentHistoryParams) =>
  useQuery({
    queryKey: [
      ...paymentsQueryKey(params.tenantId),
      params.page ?? 1,
      params.limit ?? 10,
    ] as const,
    queryFn: async (): Promise<PaymentHistoryResponse> => {
      const { data } = await apiClient.get<PaymentHistoryEnvelope>(
        "/api/payments/history",
        {
          params: {
            tenantId: params.tenantId,
            page: params.page ?? 1,
            limit: params.limit ?? 10,
          },
        }
      );
      return unwrapApiData(data);
    },
    enabled:
      !!params.tenantId &&
      params.tenantId !== "undefined" &&
      params.tenantId !== "null",
  });

// Regular PENDING invoice (BASIC / PRO)
export const usePendingPayment = (tenantId: string) =>
  useQuery({
    queryKey: pendingPaymentQueryKey(tenantId),
    queryFn: async (): Promise<PaymentTransaction | null> => {
      const { data } = await apiClient.get<PendingPaymentEnvelope>(
        "/api/payments/pending",
        { params: { tenantId } }
      );
      return unwrapApiData(data);
    },
    enabled:
      !!tenantId &&
      tenantId !== "undefined" &&
      tenantId !== "null",
  });

// CUSTOM (Enterprise) PENDING invoice with payment link
export const useCustomPendingPayment = (tenantId: string) =>
  useQuery({
    queryKey: customPendingQueryKey(tenantId),
    queryFn: async (): Promise<PaymentTransaction | null> => {
      const { data } = await apiClient.get<PendingPaymentEnvelope>(
        "/api/payments/custom/pending",
        { params: { tenantId } }
      );
      return unwrapApiData(data);
    },
    enabled:
      !!tenantId &&
      tenantId !== "undefined" &&
      tenantId !== "null",
  });

// CUSTOM (Enterprise) full payment history — no pagination, newest first
export const useCustomPaymentHistory = (tenantId: string) =>
  useQuery({
    queryKey: customHistoryQueryKey(tenantId),
    queryFn: async (): Promise<CustomPaymentHistoryResponse> => {
      const { data } = await apiClient.get<CustomPaymentHistoryEnvelope>(
        "/api/payments/custom/history",
        { params: { tenantId } }
      );
      return unwrapApiData(data);
    },
    enabled:
      !!tenantId &&
      tenantId !== "undefined" &&
      tenantId !== "null",
  });

// ─── Mutations ────────────────────────────────────────────────────────────────

export const useCreateCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      successMessage: "Checkout created",
      errorMessage: "Failed to create checkout",
    },
    mutationFn: async (
      request: CheckoutRequest
    ): Promise<CheckoutResponse> => {
      const { data } = await apiClient.post<CheckoutEnvelope>(
        "/api/payments/checkout",
        request
      );
      return unwrapApiData(data);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: pendingPaymentQueryKey(variables.tenantId),
      });
      await queryClient.invalidateQueries({
        queryKey: currentPlanQueryKey(variables.tenantId),
      });
    },
  });
};

export const useCreateCustomInvoice = () =>
  useMutation({
    meta: {
      successMessage: "Enterprise request submitted",
      errorMessage: "Failed to submit enterprise request",
    },
    mutationFn: async (
      request: CustomInvoiceRequest
    ): Promise<CustomInvoiceResponse> => {
      const { data } = await apiClient.post<CustomInvoiceEnvelope>(
        "/api/admin/invoices/custom",
        request
      );
      return unwrapApiData(data);
    },
  });

// Cancel a regular PENDING invoice (BASIC / PRO)
export const useCancelPendingPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      successMessage: "Payment cancelled",
      errorMessage: "Failed to cancel payment",
    },
    mutationFn: async (tenantId: string): Promise<void> => {
      await apiClient.delete<CancelPaymentEnvelope>(
        "/api/payments/pending",
        { params: { tenantId } }
      );
    },
    onSuccess: async (_data, tenantId) => {
      await queryClient.invalidateQueries({
        queryKey: pendingPaymentQueryKey(tenantId),
      });
      await queryClient.invalidateQueries({
        queryKey: paymentsQueryKey(tenantId),
      });
      await queryClient.invalidateQueries({
        queryKey: currentPlanQueryKey(tenantId),
      });
    },
  });
};

// Cancel auto-renewal — subscription stays active until endDate
export const useCancelSubscriptionRenewal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      successMessage:
        "Auto-renewal cancelled. Your subscription remains active until the end of the billing period.",
      errorMessage: "Failed to cancel auto-renewal",
    },
    mutationFn: async (tenantId: string): Promise<{ message: string }> => {
      const { data } = await apiClient.patch<CancelRenewalEnvelope>(
        "/api/payments/subscriptions/cancel-renewal",
        null,
        { params: { tenantId } }
      );
      return unwrapApiData(data);
    },
    onSuccess: async (_data, tenantId) => {
      await queryClient.invalidateQueries({
        queryKey: currentPlanQueryKey(tenantId),
      });
    },
  });
};

// ─── Midtrans Snap helpers ────────────────────────────────────────────────────

// Sandbox by default. Set NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=true for production.
const MIDTRANS_SNAP_URL =
  process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

export const useMidtransSnap = () => {
  const loadSnapScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.getElementById("midtrans-snap-script")) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.id = "midtrans-snap-script";
      script.src = MIDTRANS_SNAP_URL;
      script.setAttribute(
        "data-client-key",
        process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""
      );
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Midtrans Snap"));
      document.body.appendChild(script);
    });
  };

  const openSnapPopup = (
    snapToken: string,
    callbacks?: {
      onSuccess?: (result: unknown) => void;
      onPending?: (result: unknown) => void;
      onError?: (result: unknown) => void;
      onClose?: () => void;
    }
  ) => {
    const win = window as unknown as {
      snap?: { pay: (token: string, opts: unknown) => void };
    };
    if (typeof window !== "undefined" && win.snap) {
      win.snap.pay(snapToken, callbacks);
    } else {
      throw new Error("Midtrans Snap not loaded");
    }
  };

  return { loadSnapScript, openSnapPopup };
};
