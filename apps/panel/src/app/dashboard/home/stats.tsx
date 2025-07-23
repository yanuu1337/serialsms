import { SMSChart } from "#/components/chart";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "#/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

export const Stats = ({
  smsStats,
  dailySentCount,
}: {
  smsStats: { month: string; count: number }[];
  dailySentCount: { yesterday: number; today: number };
}) => {
  const percentChange =
    ((dailySentCount.today - dailySentCount.yesterday) /
      Math.max(dailySentCount.yesterday, 1)) *
    100;
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-5">
      <Card className="">
        <CardHeader>
          <CardTitle>SMS sent today</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          <p className="text-3xl font-extrabold">{dailySentCount.today}</p>
          <p className="text-muted-foreground text-sm">
            {dailySentCount.today === 1 ? "message" : "messages"} sent today
          </p>
        </CardContent>
        <CardFooter className="flex items-center justify-center">
          {dailySentCount.yesterday !== dailySentCount.today ? (
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              {/** Increase or decrease from yesterday, in percentage */}
              {Number(percentChange) > 100 ? (
                <ArrowUpIcon className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-red-500" />
              )}
              {percentChange.toFixed(2)}%{" "}
              {Number(percentChange) > 100 ? "increase" : "decrease"} from
              yesterday
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">Same as yesterday</p>
          )}
        </CardFooter>
      </Card>
      <SMSChart
        title="Monthly SMS Stats"
        data={smsStats.map((stat) => ({
          month: stat.month,
          smsCount: stat.count,
        }))}
        description="Showing total SMS sent in the last 6 months"
      />
    </div>
  );
};
