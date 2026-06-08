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
  CheckoutEnvelope,
  PaymentHistoryEnvelope,
  PendingPaymentEnvelope,
  CancelPaymentEnvelope,
  PlansEnvelope
} from "@/types/payments";

// Query keys
export const paymentsQueryKey = (tenantId: string) => ["payments", "history", tenantId];
export const pendingPaymentQueryKey = (tenantId: string) => ["payments", "pending", tenantId];

// Fetch available plans
export const usePlans = () => useQuery({
  queryKey: ["plans"],
  queryFn: async (): Promise<Plan[]> => {
    const { data } = await apiClient.get<PlansEnvelope>("/api/plans");
    return unwrapApiData(data);
  }
});

// Create checkout session
export const useCreateCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Checkout created", errorMessage: "Failed to create checkout" },
    mutationFn: async (request: CheckoutRequest): Promise<CheckoutResponse> => {
      const { data } = await apiClient.post<CheckoutEnvelope>("/api/payments/checkout", request);
      return unwrapApiData(data);
    },
    onSuccess: async (_data, variables) => {
      // Invalidate pending payment query to reflect new pending transaction
      await queryClient.invalidateQueries({
        queryKey: pendingPaymentQueryKey(variables.tenantId)
      });
    }
  });
};

// Get payment history
export const usePaymentHistory = (params: PaymentHistoryParams) => useQuery({
  queryKey: paymentsQueryKey(params.tenantId),
  queryFn: async (): Promise<PaymentHistoryResponse> => {
    const { data } = await apiClient.get<PaymentHistoryEnvelope>("/api/payments/history", {
      params: {
        tenantId: params.tenantId,
        page: params.page ?? 1,
        limit: params.limit ?? 10
      }
    });
    return unwrapApiData(data);
  },
  enabled: !!params.tenantId && params.tenantId !== "undefined" && params.tenantId !== "null"
});

// Get pending payment
export const usePendingPayment = (tenantId: string) => useQuery({
  queryKey: pendingPaymentQueryKey(tenantId),
  queryFn: async (): Promise<PaymentTransaction | null> => {
    const { data } = await apiClient.get<PendingPaymentEnvelope>("/api/payments/pending", {
      params: { tenantId }
    });
    return unwrapApiData(data);
  },
  enabled: !!tenantId && tenantId !== "undefined" && tenantId !== "null"
});

// Cancel pending payment
export const useCancelPendingPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Payment cancelled", errorMessage: "Failed to cancel payment" },
    mutationFn: async (tenantId: string): Promise<void> => {
      await apiClient.delete<CancelPaymentEnvelope>("/api/payments/pending", {
        params: { tenantId }
      });
    },
    onSuccess: async (_data, tenantId) => {
      await queryClient.invalidateQueries({
        queryKey: pendingPaymentQueryKey(tenantId)
      });
      await queryClient.invalidateQueries({
        queryKey: paymentsQueryKey(tenantId)
      });
    }
  });
};

// Midtrans Snap script URL — sandbox by default (backend returns sandbox
// redirect URLs). Set NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=true for production.
const MIDTRANS_SNAP_URL =
  process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

// Helper hook to load Midtrans Snap script
export const useMidtransSnap = () => {
  const loadSnapScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if script already loaded
      if (document.getElementById("midtrans-snap-script")) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.id = "midtrans-snap-script";
      script.src = MIDTRANS_SNAP_URL;
      script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "");
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Midtrans Snap"));
      document.body.appendChild(script);
    });
  };

  const openSnapPopup = (snapToken: string, callbacks?: {
    onSuccess?: (result: any) => void;
    onPending?: (result: any) => void;
    onError?: (result: any) => void;
    onClose?: () => void;
  }) => {
    if (typeof window !== "undefined" && (window as any).snap) {
      (window as any).snap.pay(snapToken, {
        onSuccess: callbacks?.onSuccess,
        onPending: callbacks?.onPending,
        onError: callbacks?.onError,
        onClose: callbacks?.onClose
      });
    } else {
      throw new Error("Midtrans Snap not loaded");
    }
  };

  return { loadSnapScript, openSnapPopup };
};
