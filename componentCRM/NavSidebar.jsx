import React, { Fragment } from "react";
import { LayoutDashboard, Users } from "lucide-react";

function NavSidebar({ activeView, onViewChange }) {
  const navItems = [
    { icon: LayoutDashboard, view: "dashboard", label: "Dashboard" },
    { icon: Users, view: "partners", label: "Partners" }
  ];

  return (
    <div className="flex flex-col items-center bg-white border-r border-[#f0f0f3] w-[84px] h-full relative shrink-0">
      <div className="flex items-center justify-center w-full h-[84px] shrink-0">
        <img
          src="/favicon/trans.png"
          alt="BNC Global"
          className="w-[32px] h-[32px] object-contain"
        />
      </div>

      <div className="flex flex-col items-center flex-1 gap-0 w-full">
        {navItems.map(({ icon, view, label }) => {
          const active = activeView === view;

          return (
            <div
              key={view}
              title={label}
              onClick={() => onViewChange(view)}
              className="relative w-full h-[64px] flex items-center justify-center cursor-pointer group"
            >
              {active ? (
                <Fragment>
                  <div className="absolute inset-[8px] rounded-[8px]" style={{ background: "rgba(94,129,244,0.1)" }} />
                  <div className="absolute right-0 top-[12.5%] bottom-[12.5%] w-[2px] rounded-[1px] bg-[#5e81f4]" />
                </Fragment>
              ) : null}

              {React.createElement(icon, {
                size: 22,
                className: active
                  ? "text-[#5e81f4] relative z-10"
                  : "text-[#8181a5] relative z-10 group-hover:text-[#5e81f4] transition-colors"
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { NavSidebar };
