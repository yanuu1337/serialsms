import { prisma } from "@serialsms/database";
import { createHash, randomBytes } from "crypto";

export const getUserByToken = async (token: string) => {};

export interface GenerateTokenParams {
  userId: string;
  expiresAt?: Date;
  appName?: string;
  isAdmin?: boolean;
  maxCalls?: number;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export const generateToken = async ({
  userId,
  expiresAt,
  appName,
  isAdmin,
  maxCalls,
}: GenerateTokenParams) => {
  const token = randomBytes(32).toString("hex");
  await prisma.apiToken.create({
    data: {
      id: crypto.randomUUID(),
      token: hashToken(token),
      userId,
      expiresAt,
      appName,
      isActive: true,
      isAdmin,
      calls: 0,
      maxCalls,
    },
  });
  return token;
};
