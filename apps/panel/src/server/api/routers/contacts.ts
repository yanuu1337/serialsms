import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const contactsRouter = createTRPCRouter({
  listContacts: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.smsContact.findMany({
      where: {
        creatorId:
          ctx.session.user.role == "admin" ? undefined : ctx.session.user.id,
      },
    });
  }),
  addContact: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        phoneNumber: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Admin creates global contacts (that users can see), but has access to all contacts, including user contacts
      return ctx.db.smsContact.create({
        data: {
          ...input,
          id: crypto.randomUUID(),
          creatorId:
            ctx.session.user.role == "admin" ? undefined : ctx.session.user.id,
        },
      });
    }),
  deleteContact: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Admin can delete all contacts, but users can only delete their contacts
      const contact = await ctx.db.smsContact.findUnique({
        where: {
          id: input.id,
        },
      });
      if (!contact) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact not found",
        });
      }
      if (
        contact.creatorId !== ctx.session.user.id &&
        ctx.session.user.role !== "admin"
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to delete this contact",
        });
      }
      return await ctx.db.smsContact.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
