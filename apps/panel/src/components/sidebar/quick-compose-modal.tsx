import { IconLoader2, IconMessageCircle, IconCheck } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { PhoneNumberFormatter } from "../phone-number-formatter";
import { useEffect, useRef, useState } from "react";
import { Textarea } from "../ui/textarea";
import { api } from "#/trpc/react";

export const QuickComposeModal = ({
  children,
  initialPhoneNumber,
}: {
  children: React.ReactNode;
  initialPhoneNumber?: string;
}) => {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || "");
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const { mutate: sendSMS, isPending } = api.sms.sendSMS.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setMessage("");
        setPhoneNumber("");
      }, 1500);
    },
  });
  const handleSend = () => {
    if (!phoneNumber || !message) {
      return;
    }
    sendSMS({
      receiver: phoneNumber,
      message,
    });
  };

  useEffect(() => {
    if (open && initialPhoneNumber) {
      setPhoneNumber(initialPhoneNumber);
      messageInputRef.current?.focus();
    }
  }, [open, initialPhoneNumber, messageInputRef]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconMessageCircle />
            Quick Compose
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Compose a new SMS message quickly and easily.
        </DialogDescription>
        <div className="flex flex-col gap-2">
          <PhoneNumberFormatter
            value={phoneNumber}
            onChange={(value) => setPhoneNumber(value)}
          />
          <Textarea
            placeholder="Message"
            rows={10}
            ref={messageInputRef}
            value={message}
            minLength={1}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={isPending || !phoneNumber || !message || success}
            onClick={handleSend}
          >
            {isPending ? (
              <IconLoader2 className="animate-spin" />
            ) : success ? (
              <IconCheck className="text-green-600" />
            ) : (
              "Send"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
