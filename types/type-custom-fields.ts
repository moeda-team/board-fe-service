import type { ApiEnvelope } from "@/types/api";

export type CustomFieldType = "text" | "number" | "date" | "dropdown" | "checkbox";

export interface CustomFieldDropdownOption {
  label: string;
  value: string;
  color?: string;
}

export type CustomFieldOptions =
  | (string | CustomFieldDropdownOption)[]
  | Record<string, unknown>
  | null;

export interface CustomField {
  id: string;
  name: string;
  type: CustomFieldType;
  options?: CustomFieldOptions;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CreateCustomFieldDto {
  name: string;
  type: CustomFieldType;
  options?: string[];
}

export interface UpdateCustomFieldDto {
  name?: string;
  type?: CustomFieldType;
  options?: string[];
}

export type CustomFieldsEnvelope = ApiEnvelope<CustomField[] | CustomField>;
export type CustomFieldEnvelope = ApiEnvelope<CustomField>;
