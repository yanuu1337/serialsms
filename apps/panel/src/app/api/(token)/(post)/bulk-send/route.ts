import { ApiError, ApiResponse, InternalServerError } from "#/lib/api-response";
import { defineRoute } from "#/lib/define-route";
import { sendSMS } from "#/lib/worker/send-sms";
import z from "zod";

export const POST = defineRoute(
  async ({ input, user }) => {
    let successCount = 0;
    for (const to of input.to) {
      try {
        await sendSMS({
          to,
          message: input.message,
          senderId: user.id,
        });
        successCount++;
      } catch (error) {
        console.error(error);
      }
    }
    if (successCount === 0) {
      return new InternalServerError("Error sending SMS").toResponse();
    }
    return new ApiResponse(
      {
        success: successCount,
        total: input.to.length,
      },
      200,
      `OK (${successCount} / ${input.to.length})`,
    ).toResponse();
  },
  false,
  z.object({
    to: z.array(z.string()),
    message: z.string(),
  }),
);
