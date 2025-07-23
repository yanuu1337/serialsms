"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "#/components/ui/chart";

const chartConfig = {
  smsCount: {
    label: "SMS Count",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type SMSChartProps = {
  title: string;
  description: string;
  data: {
    month: string;
    smsCount: number;
  }[];
};

export function SMSChart({ title, description, data }: SMSChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <defs>
              <linearGradient id="fillSMS" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-smsCount)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-smsCount)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="smsCount"
              type="linear"
              fill="url(#fillSMS"
              fillOpacity={0.4}
              stroke="var(--color-smsCount)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
