import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { smsQueue } from "@serialsms/queue";
import { parsePhoneNumberWithError } from "libphonenumber-js";
export const smsRouter = createTRPCRouter({
  sendSMS: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        receiver: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const phoneNumber = parsePhoneNumberWithError(input.receiver);
      const sms = await ctx.db.sms.create({
        data: {
          id: crypto.randomUUID(),
          content: input.message,
          receiver: phoneNumber.number,
          senderId: ctx.session.user.id,
        },
      });
      console.log(phoneNumber);
      await smsQueue.add("outgoing", {
        to: phoneNumber.number,
        text: input.message,
      });
      return sms;
    }),
});
