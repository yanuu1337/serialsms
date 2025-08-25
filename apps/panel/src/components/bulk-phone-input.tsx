"use client";

import { Input } from "#/components/ui/input";
import {
  isValidPhoneNumber,
  parsePhoneNumberWithError,
} from "libphonenumber-js";
import { useState, useRef, useEffect } from "react";
import { IconX } from "@tabler/icons-react";

interface BulkPhoneInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function BulkPhoneInput({
  value,
  onChange,
  placeholder = "Enter phone numbers...",
  className = "",
}: BulkPhoneInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addPhoneNumber = (phoneNumber: string) => {
    const trimmed = phoneNumber.trim();
    if (trimmed && !value.includes(trimmed)) {
      const newValue = [...value, trimmed];
      onChange(newValue);
    }
  };

  const removePhoneNumber = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Check for separators
    const separators = [",", ";", " "];
    const hasSeparator = separators.some((sep) => newValue.includes(sep));

    if (hasSeparator) {
      const parts = newValue.split(/[,;\s]+/);
      const lastPart = parts[parts.length - 1];

      // Add all complete parts except the last one
      parts.slice(0, -1).forEach((part) => {
        if (part.trim()) {
          addPhoneNumber(part.trim());
        }
      });

      // Set the remaining part as input value
      setInputValue(lastPart);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addPhoneNumber(inputValue);
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removePhoneNumber(value.length - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const parts = pastedText.split(/[,;\s]+/).filter((part) => part.trim());

    // Add all parts at once to avoid state update issues
    const newPhoneNumbers = [...value];
    parts.forEach((part) => {
      const trimmed = part.trim();
      if (trimmed && !newPhoneNumbers.includes(trimmed)) {
        newPhoneNumbers.push(trimmed);
      }
    });

    onChange(newPhoneNumbers);
    setInputValue("");
  };

  const isValidPhone = (phone: string) => {
    try {
      return isValidPhoneNumber(phone, { defaultCountry: "ID" });
    } catch {
      return false;
    }
  };

  return (
    <div className={`${className}`}>
      <div className="border-input flex min-h-[40px] flex-wrap gap-1 rounded-md border p-2">
        {value.map((phone, index) => (
          <div
            key={index}
            className={`group relative inline-flex items-center gap-1 rounded-lg px-1 py-1 text-sm font-bold transition-colors ${
              isValidPhone(phone)
                ? "border border-green-200/40 bg-green-200/90 text-green-800 hover:bg-green-200/80"
                : "border border-red-200/40 bg-red-200/90 text-red-800 hover:bg-red-200/80"
            }`}
          >
            <span>
              {isValidPhone(phone)
                ? parsePhoneNumberWithError(phone).format("INTERNATIONAL")
                : phone}
            </span>
            <button
              type="button"
              onClick={() => removePhoneNumber(index)}
              className="rounded-full p-0.5 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-200/80"
            >
              <IconX size={12} />
            </button>
          </div>
        ))}
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-[200px] flex-1 border p-1 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      {value.length > 0 && (
        <div className="text-muted-foreground text-sm">
          {value.length} phone numbers
          {value.filter((p) => !isValidPhone(p)).length > 0 &&
            `, of which ${value.filter((p) => !isValidPhone(p)).length} invalid`}
        </div>
      )}
    </div>
  );
}
