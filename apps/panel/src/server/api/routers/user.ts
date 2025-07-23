import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "#/server/api/trpc";

export const userRouter = createTRPCRouter({
  // Public procedure - anyone can access this
  getUsers: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Access the database through ctx.db
      const users = await ctx.db.user.findMany({
        take: input.limit,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });

      return users;
    }),

  // Protected procedure - only authenticated users can access this
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    // ctx.session.user is guaranteed to exist due to the middleware
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }),

  // Another protected procedure example
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        image: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Update the current user's profile
      const updatedUser = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.image && { image: input.image }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          updatedAt: true,
        },
      });

      return updatedUser;
    }),

  // Public procedure that shows session info if available
  getSessionInfo: publicProcedure.query(async ({ ctx }) => {
    return {
      isAuthenticated: !!ctx.session?.user,
      user: ctx.session?.user
        ? {
            id: ctx.session.user.id,
            email: ctx.session.user.email,
          }
        : null,
    };
  }),
});
