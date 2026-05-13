"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from "@/components/ui/input-group";
import { Search } from "lucide-react";

interface SearchBoxProps {
  value?: string;
  onChange?: (value: string) => void;
  resultCount?: number;
  placeholder?: string;
}

const SearchBox = ({
  value,
  onChange,
  resultCount,
  placeholder = "Search..."
}: SearchBoxProps) => {
  return (
    <InputGroup className="max-w-xs">
      <InputGroupInput
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      />
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      {typeof resultCount === "number" && (
        <InputGroupAddon align="inline-end">
          {resultCount} results
        </InputGroupAddon>
      )}
    </InputGroup>
  );
};

export default SearchBox;
