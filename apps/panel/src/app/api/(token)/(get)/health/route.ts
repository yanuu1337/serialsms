import { z } from "zod";
import { defineRoute } from "#/lib/define-route";
import { ApiResponse } from "#/lib/api-response";

export const GET = defineRoute(async ({ input, req }) => {
  return new ApiResponse("OK", 200, "OK").toResponse();
});
