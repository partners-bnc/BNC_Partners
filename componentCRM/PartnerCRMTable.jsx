import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";

const statusStyles = {
  Complete: { color: "#5e81f4", bg: "rgba(94,129,244,0.10)" },
  Pending: { color: "#f4be5e", bg: "rgba(244,190,94,0.12)" },
  Active: { color: "#7ce7ac", bg: "rgba(124,231,172,0.12)" },
  Signed: { color: "#7ce7ac", bg: "rgba(124,231,172,0.12)" }
};

function StatusBadge({ value }) {
  const style = statusStyles[value] || { color: "#8181a5", bg: "rgba(129,129,165,0.10)" };
  return (
    <span
      className="inline-block px-2.5 py-1 rounded-[6px] text-[11px] font-bold whitespace-nowrap"
      style={{ color: style.color, background: style.bg }}
    >
      {value}
    </span>
  );
}

function PartnerCRMTable({ partners = [], adminLabel = "Admin", onLogout }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return partners;

    return partners.filter((p) =>
      [p.name, p.email, p.phone, p.country, p.city, p.aiProfileStatus, p.agreementStatus, p.onboardingStatus]
        .map((v) => String(v || "").toLowerCase())
        .some((v) => v.includes(query))
    );
  }, [partners, search]);

  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
      <div className="flex items-center justify-between px-7 h-[84px] bg-[#f5f5fa] shrink-0 border-b border-[#ececf2]">
        <div>
          <h1 className="text-[#1c1d21] text-[20px] font-bold">Partner CRM</h1>
          <p className="text-[#8181a5] text-[12px]">Signed in as {adminLabel}</p>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-[8px] text-[13px] font-bold text-white"
          style={{ background: "linear-gradient(135deg, #5e81f4 0%, #4060d8 100%)" }}
        >
          Logout
        </button>
      </div>

      <div className="flex-1 overflow-hidden px-7 pb-7 pt-4 flex flex-col gap-4">
        <div className="relative w-full max-w-[360px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8181a5]" />
          <input
            type="text"
            placeholder="Search partners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#f0f0f3] rounded-[8px] pl-9 pr-4 py-2 text-[13px] text-[#1c1d21] placeholder-[#8181a5] outline-none focus:border-[#5e81f4] transition-colors"
          />
        </div>

        <div className="bg-white rounded-[12px] border border-[#f0f0f3] overflow-auto flex-1">
          <table className="w-full min-w-[1200px]">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-[#f0f0f3]">
                <th className="text-left px-4 py-3 text-[#5e81f4] text-[12px] font-bold">Partner Name</th>
                <th className="text-left px-4 py-3 text-[#5e81f4] text-[12px] font-bold">Email</th>
                <th className="text-left px-4 py-3 text-[#5e81f4] text-[12px] font-bold">Phone</th>
                <th className="text-left px-4 py-3 text-[#5e81f4] text-[12px] font-bold">Country</th>
                <th className="text-left px-4 py-3 text-[#5e81f4] text-[12px] font-bold">City</th>
                <th className="text-left px-4 py-3 text-[#5e81f4] text-[12px] font-bold">Registration Date</th>
                <th className="text-left px-4 py-3 text-[#5e81f4] text-[12px] font-bold">AI Profile Status</th>
                <th className="text-left px-4 py-3 text-[#5e81f4] text-[12px] font-bold">Agreement Status</th>
                <th className="text-left px-4 py-3 text-[#5e81f4] text-[12px] font-bold">Onboarding Status</th>
                <th className="text-left px-4 py-3 text-[#5e81f4] text-[12px] font-bold">Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((partner, i) => (
                <tr
                  key={partner.id || `${partner.email}-${i}`}
                  className={`border-b border-[#f5f5fa] last:border-0 hover:bg-[#f9f9fc] transition-colors ${
                    i % 2 === 0 ? "" : "bg-[#fafafa]"
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-[#1c1d21] text-[13px] font-bold">{partner.name || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-[#5e81f4] text-[12px]">{partner.email || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-[#1c1d21] text-[12px]">{partner.phone || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-[#1c1d21] text-[12px]">{partner.country || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-[#1c1d21] text-[12px]">{partner.city || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-[#8181a5] text-[12px]">{partner.registrationDateLabel || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge value={partner.aiProfileStatus || "Pending"} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge value={partner.agreementStatus || "Pending"} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge value={partner.onboardingStatus || "Pending"} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-[#8181a5] text-[12px]">{partner.lastUpdatedLabel || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 ? (
            <div className="flex items-center justify-center h-[200px]">
              <p className="text-[#8181a5] text-[14px]">No partners match your search.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export { PartnerCRMTable };
