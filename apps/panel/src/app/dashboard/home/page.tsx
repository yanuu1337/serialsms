import { api } from "#/trpc/server";
import dayjs from "dayjs";
import { Stats } from "#/components/dashboard/home/stats";

export default async function Page() {
  const smsStats = await api.stats.getMonthlyStatistics({
    startDate: dayjs().subtract(6, "month").toDate(),
    endDate: dayjs().toDate(),
  });
  const dailySentCount = await api.stats.getDailySentCount();
  console.log(smsStats);
  return (
    <div className="flex flex-col gap-4">
      <Stats smsStats={smsStats} dailySentCount={dailySentCount} />
    </div>
  );
}
