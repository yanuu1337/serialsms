import { ApiResponse } from "#/lib/api-response";
import { defineRoute } from "#/lib/define-route";
import { sendSMS } from "#/lib/worker/send-sms";
import z from "zod";

export const POST = defineRoute(
  async ({ input, req, user }) => {
    try {
      await sendSMS({
        to: input.to,
        message: input.message,
        senderId: user.id,
      });
    } catch (error) {
      console.error(error);
      return new ApiResponse("Error", 500, "Error sending SMS").toResponse();
    }
    return new ApiResponse("OK", 200, "OK").toResponse();
  },
  false,
  z.object({
    to: z.string(),
    message: z.string(),
  }),
);
