import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

function StatsCards({ stats = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-[12px] px-6 py-4 border border-[#f0f0f3]">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-[#1c1d21] text-[16px] font-bold leading-tight">{stat.label}</p>
              <p className="text-[#8181a5] text-[12px] mt-0.5">{stat.sublabel}</p>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[#1c1d21] text-[18px] font-black">{stat.value}</span>
              {stat.trend === "down" ? (
                <TrendingDown size={16} className="text-[#ff808b]" />
              ) : (
                <TrendingUp size={16} className="text-[#7ce7ac]" />
              )}
            </div>
          </div>
          <div className="mt-3 h-[4px] rounded-full w-full" style={{ background: stat.progressBg || "#f0f0f3" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, Math.max(0, Number(stat.progress || 0) * 100))}%`,
                background: stat.progressColor || "#5e81f4"
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export { StatsCards };
