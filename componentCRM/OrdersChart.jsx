import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const tabs = ["Day", "Week", "Month"];

function OrdersChart({ dataByRange }) {
  const [activeTab, setActiveTab] = useState("Month");
  const data = dataByRange?.[activeTab] || [];

  return (
    <div className="bg-white rounded-[12px] p-5 border border-[#f0f0f3] flex-1 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#1c1d21] text-[16px] font-bold">Partner Onboarding Trend</h2>
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-[8px] text-[13px] font-bold transition-colors ${
                activeTab === tab
                  ? "bg-white border border-[#ececf2] text-[#1c1d21] shadow-sm"
                  : "text-[#8181a5] hover:text-[#5e81f4]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="registrationsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5e81f4" stopOpacity={0.26} />
                <stop offset="95%" stopColor="#5e81f4" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="completedFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7ce7ac" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7ce7ac" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#eef0f6" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#7d84ad", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: "#7d84ad", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 10, border: "1px solid #eef0f6" }}
              formatter={(value, key) => [value, key === "registrations" ? "Registrations" : "AI Complete"]}
            />
            <Legend formatter={(value) => (value === "registrations" ? "Registrations" : "AI Complete")} />

            <Area type="monotone" dataKey="registrations" stroke="#5e81f4" strokeWidth={2} fill="url(#registrationsFill)" />
            <Area type="monotone" dataKey="completed" stroke="#7ce7ac" strokeWidth={2} fill="url(#completedFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export { OrdersChart };
