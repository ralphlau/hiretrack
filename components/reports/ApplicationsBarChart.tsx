"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface MonthDatum {
  month: string;
  count: number;
}

/**
 * Same rationale as PipelinePieChart — kept in its own client chunk so
 * recharts loads on demand rather than as part of /reports' initial bundle.
 */
export function ApplicationsBarChart({ data }: { data: MonthDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e3e1dc" />
        <XAxis dataKey="month" stroke="#87847d" fontSize={12} />
        <YAxis stroke="#87847d" fontSize={12} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: "#ffffff",
            border: "1px solid #e3e1dc",
            borderRadius: 8,
            color: "#17171a",
            fontSize: 13,
          }}
        />
        <Bar dataKey="count" fill="#1f3358" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
