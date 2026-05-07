import type { ApiEnvelope, AuthMeResponse as AuthMeResponseModel } from "@/types/api";

export type AuthMeResponse = AuthMeResponseModel;
export type AuthGoogleResponse = Record<string, unknown>;

export type AuthGoogleEnvelope = ApiEnvelope<AuthGoogleResponse>;
export type AuthMeEnvelope = ApiEnvelope<AuthMeResponse>;
