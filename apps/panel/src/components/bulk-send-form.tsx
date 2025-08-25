"use client";

import { BulkPhoneInput } from "#/components/bulk-phone-input";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { Textarea } from "#/components/ui/textarea";
import { api } from "#/trpc/react";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useState, useMemo, useCallback } from "react";
import {
  IconLoader2,
  IconCheck,
  IconAlertCircle,
  IconWritingSign,
  IconWriting,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { count } from "sms-length";
import { useDebounceWithStatus } from "#/lib/hooks";

export function BulkSendForm() {
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  // Enhanced debounce with typing status
  const { value: debouncedMessage, isDebouncing } = useDebounceWithStatus(
    message,
    500,
  );

  // Memoize the count calculation to avoid unnecessary recalculations
  const messageLength = useMemo(() => {
    return count(debouncedMessage);
  }, [debouncedMessage]);

  const { mutate: bulkSendSMS, isPending } = api.sms.bulkSendSMS.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Successfully sent ${data.successCount} out of ${data.totalCount} messages`,
        {
          richColors: true,
        },
      );
      setPhoneNumbers([]);
      setMessage("");
    },
    onError: (error) => {
      toast.error(`Error sending messages: ${error.message}`);
    },
  });

  // Memoize phone number validation to avoid recalculating on every render
  const { validPhoneNumbers, invalidPhoneNumbers } = useMemo(() => {
    const valid = phoneNumbers.filter((p) =>
      isValidPhoneNumber(p, { defaultCountry: "ID" }),
    );
    const invalid = phoneNumbers.filter(
      (p) => !isValidPhoneNumber(p, { defaultCountry: "ID" }),
    );
    return { validPhoneNumbers: valid, invalidPhoneNumbers: invalid };
  }, [phoneNumbers]);

  // Memoize the send button state
  const canSend = useMemo(() => {
    return validPhoneNumbers.length > 0 && message.trim().length > 0;
  }, [validPhoneNumbers.length, message]);

  const handleSend = useCallback(() => {
    if (!canSend) return;

    bulkSendSMS({
      message: message.trim(),
      receivers: validPhoneNumbers,
    });
  }, [canSend, message, validPhoneNumbers, bulkSendSMS]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Bulk SMS</CardTitle>
        <CardDescription>
          Send the same message to multiple phone numbers. Invalid numbers will
          be highlighted in red and excluded from sending.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Phone Numbers</label>
          <BulkPhoneInput
            value={phoneNumbers}
            onChange={setPhoneNumbers}
            placeholder="Enter phone numbers separated by comma, space, or semicolon..."
          />
          {invalidPhoneNumbers.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <IconAlertCircle size={16} />
              {invalidPhoneNumbers.length} invalid phone number(s) will be
              excluded
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Message</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message..."
            rows={4}
          />
          <div className="text-muted-foreground text-sm">
            {isDebouncing ? (
              <span className="flex items-center gap-2">
                <IconWriting className="h-4 w-4 animate-pulse" />
                Typing...
              </span>
            ) : (
              `${messageLength?.length} characters, ${messageLength?.messages} SMS`
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            {validPhoneNumbers.length > 0 && (
              <span>
                Ready to send to {validPhoneNumbers.length} recipients
              </span>
            )}
          </div>
          <Button
            onClick={handleSend}
            disabled={!canSend || isPending || isDebouncing}
            className="min-w-[120px]"
          >
            {isPending ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <IconCheck className="mr-2 h-4 w-4" />
                Send SMS
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
