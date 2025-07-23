import { z, ZodSchema } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { BadRequestError, UnauthorizedError } from "./api-response";
import { prisma, User } from "@serialsms/database";
import { hashToken } from "./auth/token";
import dayjs from "dayjs";

const USER_INCLUDE = {
  id: true,
  banned: true,
  name: true,
  email: true,
  username: true,
  displayUsername: true,
};
type UserIncludeKeys = keyof typeof USER_INCLUDE;
type HandlerFn<TInput> = ({
  input,
  req,
  user,
}: {
  input: TInput;
  req: NextRequest;
  user: Pick<User, UserIncludeKeys>;
}) => Promise<Response | NextResponse>;

export function defineRoute<TSchema extends ZodSchema<any>>(
  handler: HandlerFn<z.infer<TSchema>>,
  isFreePath: boolean | undefined,
  schema: TSchema,
): (req: NextRequest) => Promise<Response | NextResponse>;

export function defineRoute(
  handler: HandlerFn<undefined>,
  isFreePath?: boolean,
  schema?: undefined,
): (req: NextRequest) => Promise<Response | NextResponse>;

// Implementation
export function defineRoute<TSchema extends ZodSchema<any>>(
  handler: HandlerFn<any>,
  isFreePath?: boolean,
  schema?: TSchema,
) {
  return async function route(req: NextRequest) {
    const headerList = await headers();
    const authHeader = headerList.get("Authorization");
    if (!authHeader) {
      return new UnauthorizedError("Unauthorized").toResponse();
    }

    const tokenStr = authHeader.split(" ")[1]?.trim();

    if (!tokenStr) {
      return new UnauthorizedError("Unauthorized").toResponse();
    }

    const token = await prisma.apiToken.findFirst({
      where: {
        token: hashToken(tokenStr),
      },
      include: {
        user: {
          select: USER_INCLUDE,
        },
      },
    });

    if (!token) {
      return new UnauthorizedError("Unauthorized").toResponse();
    }
    if (dayjs().isAfter(token?.expiresAt)) {
      return new UnauthorizedError("Token expired").toResponse();
    }
    if (token.maxCalls && token.calls >= token.maxCalls) {
      return new UnauthorizedError(
        "Token limit reached. Increase limit in developer settings or generate new token.",
      ).toResponse();
    }

    let json: any;
    let parsed: z.SafeParseReturnType<any, any> | undefined;
    try {
      if (schema) {
        json = await req.json();
        parsed = schema.safeParse(json);
        if (!parsed.success) {
          return new BadRequestError(
            "Invalid payload",
            parsed.error.errors,
          ).toResponse();
        }
      }
    } catch {
      return new BadRequestError("Invalid JSON").toResponse();
    }

    if (!isFreePath)
      await prisma.apiToken.update({
        where: {
          id: token.id,
        },
        data: {
          calls: {
            increment: 1,
          },
        },
      });

    // Type-safe: if schema is present, parsed is always defined and success is true
    // If schema is not present, input is always undefined
    return handler({
      input: schema ? parsed!.data : undefined,
      req,
      user: token.user,
    });
  };
}
