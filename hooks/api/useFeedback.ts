import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";

export interface SubmitFeedbackPayload {
  title: string;
  description: string;
  category: "bug" | "feature";
  email?: string;
  attachments?: File[];
}

export const useSubmitFeedback = () => {
  return useMutation({
    mutationFn: async (payload: SubmitFeedbackPayload) => {
      const formData = new FormData();
      formData.append("title", payload.title);
      formData.append("description", payload.description);
      formData.append("category", payload.category);
      if (payload.email) formData.append("email", payload.email);
      if (payload.attachments) {
        payload.attachments.forEach((file) =>
          formData.append("attachments", file)
        );
      }

      const { data } = await apiClient.post("/api/feedbacks", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
  });
};
