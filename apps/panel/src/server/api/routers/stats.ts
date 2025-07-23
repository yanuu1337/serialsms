import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import dayjs from "dayjs";

export const statsRouter = createTRPCRouter({
  getMonthlyStatistics: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const sms = await ctx.db.sms.findMany({
        where: {
          createdAt: { gte: input.startDate, lte: input.endDate },
        },
      });
      const grouped = sms.reduce(
        (acc, sms) => {
          const year = sms.createdAt.getFullYear();
          const monthNum = sms.createdAt.getMonth() + 1; // 1-based
          const key = `${year}-${monthNum.toString().padStart(2, "0")}`;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );
      return Object.entries(grouped)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([key, count]) => {
          const [year, month] = key.split("-");
          const date = new Date(Number(year), Number(month) - 1);
          const label = date.toLocaleString("default", {
            month: "short",
            year: "numeric",
          });
          return {
            month: label,
            count,
          };
        });
    }),
  getDailySentCount: protectedProcedure.query(async ({ ctx }) => {
    const sms = await ctx.db.sms.findMany({
      where: {
        createdAt: {
          gte: dayjs().subtract(2, "days").toDate(),
          lte: dayjs().toDate(),
        },
      },
    });
    return {
      yesterday:
        sms.filter((sms) =>
          dayjs(sms.createdAt).isSame(dayjs().subtract(1, "day"), "day"),
        ).length ?? 0,
      today:
        sms.filter((sms) => dayjs(sms.createdAt).isSame(dayjs(), "day"))
          .length ?? 0,
    };
  }),
});
