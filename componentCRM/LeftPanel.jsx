import React from "react";
import { Activity, Users, UserCheck, Clock3 } from "lucide-react";

const iconByType = {
  total: Users,
  complete: UserCheck,
  pending: Clock3,
  thisMonth: Activity
};

function LeftPanel({ adminName = "Admin", updates = [], monthDelta = "+0%" }) {
  return (
    <div className="hidden 2xl:flex flex-col bg-white border-r border-[#f0f0f3] w-[280px] shrink-0 h-full overflow-y-auto">
      <div className="px-6 pt-6 pb-4">
        <img
          src="/favicon/trans.png"
          alt="BNC Global"
          className="w-[80px] object-contain mb-4"
        />
        <p className="text-[#1c1d21] text-[15px] font-light tracking-wide">Welcome,</p>
        <p className="text-[#1c1d21] text-[20px] font-black tracking-wide mt-0.5 truncate">{adminName}</p>
      </div>

      <div className="px-6 py-4 flex-1">
        <p className="text-[#1c1d21] text-[14px] font-bold mb-3">Live summary</p>
        <div className="flex flex-col gap-2">
          {updates.map((item) => {
            const Icon = iconByType[item.type] || Activity;
            return (
              <div key={item.label} className="flex items-center gap-3 bg-[#f5f5fa] rounded-[10px] px-3 py-2.5">
                <div
                  className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center shrink-0"
                  style={{ background: "rgba(94,129,244,0.1)" }}
                >
                  <Icon size={16} style={{ color: "#5e81f4" }} />
                </div>
                <span className="text-[#1c1d21] text-[12px] font-bold flex-1 leading-tight">{item.label}</span>
                <span className="text-[#8181a5] text-[11px] font-bold shrink-0 whitespace-nowrap">{item.value}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="bg-[rgba(94,129,244,0.08)] rounded-[12px] p-4 flex items-center gap-3">
          <div
            className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center shrink-0"
            style={{ background: "rgba(94,129,244,0.15)" }}
          >
            <Activity size={18} className="text-[#5e81f4]" />
          </div>
          <div>
            <p className="text-[#1c1d21] text-[12px] font-bold">This month</p>
            <p className="text-[#5e81f4] text-[11px]">{monthDelta} vs previous month</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { LeftPanel };
