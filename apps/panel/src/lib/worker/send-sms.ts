import { prisma } from "@serialsms/database";
import { smsQueue } from "@serialsms/queue";
import { parsePhoneNumberWithError } from "libphonenumber-js";

export interface SendSMSProps {
  to: string;
  message: string;
  senderId: string;
}
export const sendSMS = async ({ to, message, senderId }: SendSMSProps) => {
  const phoneNumber = parsePhoneNumberWithError(to);
  const sms = await prisma.sms.create({
    data: {
      id: crypto.randomUUID(),
      content: message,
      receiver: phoneNumber.number,
      senderId: senderId,
    },
  });
  console.log(phoneNumber);
  await smsQueue.add("outgoing", {
    to: phoneNumber.number,
    text: message,
  });
  return sms;
};
