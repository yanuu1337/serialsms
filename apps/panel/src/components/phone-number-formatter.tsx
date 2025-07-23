"use client";

import { Input } from "#/components/ui/input";
import {
  AsYouType,
  isValidPhoneNumber,
  parsePhoneNumberWithError,
} from "libphonenumber-js";
import { useEffect, useState } from "react";

interface PhoneNumberFormatterProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
}

export function PhoneNumberFormatter({
  value = "",
  onChange,
  error,
  ...props
}: PhoneNumberFormatterProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (value) {
      setInputValue(value);
      try {
        const phoneNumber = parsePhoneNumberWithError(value);
        if (phoneNumber) {
          setIsValid(isValidPhoneNumber(phoneNumber.number));
        }
      } catch {
        setIsValid(false);
      }
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    let formatted = newValue;

    try {
      const valueToFormat = newValue.startsWith("+")
        ? newValue
        : `+1${newValue}`;

      const asYouType = new AsYouType();
      formatted = asYouType.input(valueToFormat);

      const isValidNumber = isValidPhoneNumber(formatted);
      setIsValid(isValidNumber);
    } catch {
      formatted = newValue;
      setIsValid(false);
    }

    setInputValue(formatted);

    if (onChange) {
      onChange(formatted);
    }
  };

  return (
    <Input
      {...props}
      value={inputValue}
      onChange={handleChange}
      type="tel"
      className={`${props.className ?? ""} ${error || !isValid ? "border-red-500" : ""}`}
      placeholder="+1 (123) 456-7890"
    />
  );
}
