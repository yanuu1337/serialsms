"use client";
import { PhoneNumberFormatter } from "#/components/phone-number-formatter";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardFooter,
} from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { api } from "#/trpc/react";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useState } from "react";

export default function Compose() {
  const { mutate: sendSMS } = api.sms.sendSMS.useMutation();
  const [message, setMessage] = useState("");
  const [receiver, setReceiver] = useState("");
  return (
    <div className="container mx-auto flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Compose</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <PhoneNumberFormatter
              value={receiver}
              onChange={(value) => setReceiver(value)}
              error={!isValidPhoneNumber(receiver)}
            />
            <Input
              type="text"
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => {
              sendSMS({ message, receiver });
            }}
          >
            Send
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
