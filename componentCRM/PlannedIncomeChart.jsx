import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function PlannedIncomeChart({ data = [] }) {
  return (
    <div className="bg-white rounded-[12px] p-5 border border-[#f0f0f3] w-full xl:w-[340px] shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#1c1d21] text-[16px] font-bold">Cumulative Partner Growth</h2>
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef0f6" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#7d84ad", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: "#7d84ad", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 10, border: "1px solid #eef0f6" }}
              formatter={(value) => [value, "Cumulative Partners"]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#5e81f4"
              strokeWidth={3}
              dot={{ r: 3, fill: "#5e81f4" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export { PlannedIncomeChart };
