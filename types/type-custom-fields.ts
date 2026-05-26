import type { ApiEnvelope } from "@/types/api";

export type CustomFieldType = "text" | "number" | "date" | "dropdown" | "checkbox";

export interface CustomFieldDropdownOption {
  label: string;
  value: string;
  color?: string;
}

export type CustomFieldDropdownOptionInput = {
  label: string;
  value: string;
  color: string;
};

export type CustomFieldTextOptionsInput = {
  placeholder?: string;
  maxLength?: number;
};

export type CustomFieldNumberOptionsInput = {
  min?: number;
  max?: number;
};

export type CustomFieldOptionsInput =
  | CustomFieldDropdownOptionInput[]
  | CustomFieldTextOptionsInput
  | CustomFieldNumberOptionsInput
  | Record<string, unknown>
  | null;

export type CustomFieldOptions =
  | (string | CustomFieldDropdownOption)[]
  | Record<string, unknown>
  | null;

export interface CustomField {
  id: string;
  name: string;
  type: CustomFieldType;
  options?: CustomFieldOptions;
  color?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CreateCustomFieldDto {
  name: string;
  type: CustomFieldType;
  color: string;
  options?: CustomFieldOptionsInput;
}

export interface UpdateCustomFieldDto {
  name?: string;
  type?: CustomFieldType;
  color?: string;
  options?: CustomFieldOptionsInput;
}

export type CustomFieldsEnvelope = ApiEnvelope<CustomField[] | CustomField>;
export type CustomFieldEnvelope = ApiEnvelope<CustomField>;
