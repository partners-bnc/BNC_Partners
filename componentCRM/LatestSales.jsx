import React from "react";

function LatestSales({ rows = [] }) {
  return (
    <div className="bg-white rounded-[12px] border border-[#f0f0f3] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#1c1d21] text-[16px] font-bold">Latest Partner Registrations</h2>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-[#f0f0f3]">
              <th className="text-left pb-3 text-[#5e81f4] text-[12px] font-bold pr-4">Partner</th>
              <th className="text-left pb-3 text-[#5e81f4] text-[12px] font-bold pr-4">Email</th>
              <th className="text-left pb-3 text-[#5e81f4] text-[12px] font-bold pr-4">Country</th>
              <th className="text-left pb-3 text-[#5e81f4] text-[12px] font-bold pr-4">Registered</th>
              <th className="text-right pb-3 text-[#5e81f4] text-[12px] font-bold">AI Profile</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-[#f5f5fa] last:border-0 hover:bg-[#f9f9fc] transition-colors">
                <td className="py-3 pr-4">
                  <p className="text-[#1c1d21] text-[13px] font-bold leading-tight">{row.name}</p>
                  <p className="text-[#8181a5] text-[11px] mt-0.5">{row.phone || "-"}</p>
                </td>
                <td className="py-3 pr-4 text-[#1c1d21] text-[13px]">{row.email || "-"}</td>
                <td className="py-3 pr-4 text-[#1c1d21] text-[13px]">{row.country || "-"}</td>
                <td className="py-3 pr-4 text-[#8181a5] text-[13px]">{row.registrationDateLabel || "-"}</td>
                <td className="py-3 text-right">
                  <span
                    className="inline-block px-3 py-1 rounded-[6px] text-[12px] font-bold"
                    style={{
                      color: row.aiProfileStatus === "Complete" ? "#7ce7ac" : "#f4be5e",
                      background: row.aiProfileStatus === "Complete" ? "rgba(124,231,172,0.12)" : "rgba(244,190,94,0.12)"
                    }}
                  >
                    {row.aiProfileStatus || "Pending"}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-[#8181a5] text-[13px]">
                  No partner data available.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { LatestSales };
