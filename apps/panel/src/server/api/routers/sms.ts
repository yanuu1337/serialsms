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
  bulkSendSMS: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        receivers: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const results = [];
      let successCount = 0;

      for (const receiver of input.receivers) {
        try {
          const phoneNumber = parsePhoneNumberWithError(receiver);
          const sms = await ctx.db.sms.create({
            data: {
              id: crypto.randomUUID(),
              content: input.message,
              receiver: phoneNumber.number,
              senderId: ctx.session.user.id,
            },
          });

          await smsQueue.add("outgoing", {
            to: phoneNumber.number,
            text: input.message,
          });

          results.push({ receiver, success: true, sms });
          successCount++;
        } catch (error) {
          results.push({
            receiver,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return {
        successCount,
        totalCount: input.receivers.length,
        results,
      };
    }),
});
