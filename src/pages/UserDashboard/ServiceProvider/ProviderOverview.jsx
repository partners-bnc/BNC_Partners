import React from 'react';
import { CreditCard, Briefcase, Star, ChevronRight, Calendar as CalendarIcon, CheckCircle2, ArrowRight } from 'lucide-react';

const ProviderOverview = ({
  listedServices,
  providerTransactions,
  providerConsultations,
  handleTabChange
}) => {
  return (
    <div className="space-y-8 animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">

      {/* KEY METRICS BANNER (4 CARDS) - Rich hover effects with crimson border glows */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Card 1: Total Earnings */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-3xl p-5 min-h-[148px] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden group transition-all duration-300 hover:-translate-y-1.5 hover:border-[#E52E38]/50 hover:shadow-[0_12px_24px_-10px_rgba(229,46,56,0.15)]">
          <div>
            <div className="flex items-center gap-2 text-slate-555 dark:text-slate-400">
              <CreditCard className="w-4.5 h-4.5 text-slate-850 dark:text-slate-200 shrink-0 transition-colors group-hover:text-[#E52E38]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Total Earnings</span>
            </div>
            <div className="text-3xl font-black text-slate-905 dark:text-white tracking-tight mt-3 text-center transition-transform duration-300 group-hover:scale-105">
              ${providerTransactions.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}.00
            </div>
          </div>
          <div className="text-center mt-1">
            <span className="text-[10px] font-bold text-[#E52E38]">
              +15% this month
            </span>
          </div>
        </div>

        {/* Card 2: Active Services */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-3xl p-5 min-h-[148px] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden group transition-all duration-300 hover:-translate-y-1.5 hover:border-[#E52E38]/50 hover:shadow-[0_12px_24px_-10px_rgba(229,46,56,0.15)]">
          <div>
            <div className="flex items-center gap-2 text-slate-555 dark:text-slate-400">
              <Briefcase className="w-4.5 h-4.5 text-slate-850 dark:text-slate-200 shrink-0 transition-colors group-hover:text-[#E52E38]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Active Services</span>
            </div>
            <div className="text-3xl font-black text-slate-905 dark:text-white tracking-tight mt-3 text-center transition-transform duration-300 group-hover:scale-105">
              {listedServices.length}
            </div>
          </div>
          <div className="text-center mt-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-455">
              Services Listed
            </span>
          </div>
        </div>

        {/* Card 3: Total Bookings */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-3xl p-5 min-h-[148px] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden group transition-all duration-300 hover:-translate-y-1.5 hover:border-[#E52E38]/50 hover:shadow-[0_12px_24px_-10px_rgba(229,46,56,0.15)]">
          <div>
            <div className="flex items-center gap-2 text-slate-555 dark:text-slate-400">
              <CalendarIcon className="w-4.5 h-4.5 text-slate-850 dark:text-slate-200 shrink-0 transition-colors group-hover:text-[#E52E38]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Total Bookings</span>
            </div>
            <div className="text-3xl font-black text-slate-905 dark:text-white tracking-tight mt-3 text-center transition-transform duration-300 group-hover:scale-105">
              {providerConsultations.length}
            </div>
          </div>
          <div className="text-center mt-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-455">
              Scheduled Calls
            </span>
          </div>
        </div>

        {/* Card 4: Client Rating */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-3xl p-5 min-h-[148px] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden group transition-all duration-300 hover:-translate-y-1.5 hover:border-[#E52E38]/50 hover:shadow-[0_12px_24px_-10px_rgba(229,46,56,0.15)]">
          <div>
            <div className="flex items-center gap-2 text-slate-555 dark:text-slate-400">
              <Star className="w-4.5 h-4.5 text-slate-855 dark:text-slate-200 shrink-0 transition-colors group-hover:text-[#E52E38]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Client Rating</span>
            </div>
            <div className="text-3xl font-black text-slate-905 dark:text-white tracking-tight mt-3 text-center transition-transform duration-300 group-hover:scale-105">
              4.9
            </div>
          </div>
          <div className="text-center mt-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-455">
              / 5.0 (24 reviews)
            </span>
          </div>
        </div>

      </section>

      {/* MAIN DASHBOARD CONTENT SPLIT GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Active Services & Recent Transactions (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-8">

          {/* Active Services Widget Card */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-5 h-5 text-slate-800 dark:text-slate-200 shrink-0" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Active Services
                </h2>
              </div>
              <button
                onClick={() => handleTabChange('services')}
                className="text-xs font-bold text-[#E52E38] hover:text-[#C81E27] transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <span>Manage Services</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2-Column Grid for Active Services */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listedServices.map((service, idx) => (
                <div
                  key={service.id}
                  className={`p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 hover:border-[#E52E38] transition-all flex flex-col justify-between space-y-3 ${idx === 2 && listedServices.length === 3 ? 'md:col-span-2' : ''
                    }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{service.title}</h3>
                      <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-550 dark:text-slate-455 font-medium leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                    <span className="text-xs font-black text-[#0F2A4A] dark:text-blue-300">
                      ${service.price} / {service.unit}
                    </span>
                    <button
                      onClick={() => handleTabChange('services')}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-905 dark:hover:text-white cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions Widget Card */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-slate-800 dark:text-slate-200 shrink-0" />
                <h2 className="text-xl font-bold text-slate-905 dark:text-white tracking-tight">
                  Recent Transactions
                </h2>
              </div>
              <button
                onClick={() => handleTabChange('ledger')}
                className="text-xs font-bold text-[#E52E38] hover:text-[#C81E27] transition-colors cursor-pointer"
              >
                View All
              </button>
            </div>

            {/* Clean Transactions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Client</th>
                    <th className="py-3 px-2">Service</th>
                    <th className="py-3 px-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium text-slate-700 dark:text-slate-300">
                  {providerTransactions.slice(0, 3).map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-2 text-slate-550 dark:text-slate-400">{tx.date}</td>
                      <td className="py-3.5 px-2 font-bold text-slate-905 dark:text-white">{tx.client}</td>
                      <td className="py-3.5 px-2">{tx.service}</td>
                      <td className="py-3.5 px-2 text-right font-black text-slate-905 dark:text-white">
                        ${tx.amount.toLocaleString()}.00
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Upcoming Consultations (4 cols on lg) */}
        <div className="lg:col-span-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <CalendarIcon className="w-5 h-5 text-slate-800 dark:text-slate-200 shrink-0" />
              <h2 className="text-xl font-bold text-slate-905 dark:text-white tracking-tight">
                Upcoming Consultations
              </h2>
            </div>

            {/* Consultation Items List */}
            <div className="space-y-3">
              {providerConsultations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleTabChange('calendar')}
                  className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-start space-x-3.5 hover:bg-indigo-50 dark:hover:bg-indigo-955/50 transition-all cursor-pointer font-sans"
                >
                  <CalendarIcon className="w-5 h-5 text-slate-800 dark:text-slate-200 shrink-0" />
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{c.client}</h4>
                    <p className="text-[11px] text-slate-550 dark:text-slate-400 truncate mt-0.5">{c.service} • {c.date} • {c.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* View Full Calendar Action Button */}
          <button
            onClick={() => handleTabChange('calendar')}
            className="w-full py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all shadow-xs text-center cursor-pointer"
          >
            View Full Calendar
          </button>
        </div>

      </section>

      {/* SECTION 2: MY SERVICES (3 CATEGORY CARDS MATCHING DESIGN) */}
      <section className="pt-4">
        {/* Vertical Red Bar Section Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-1.5 h-7 bg-[#E52E38] rounded-full"></div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            My Services
          </h2>
        </div>

        {/* 3-Column Service Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Category 1: Finance */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-[0_16px_32px_-8px_rgba(15,42,74,0.08)] transition-all duration-300">
            <div>
              {/* Card Banner Image */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
                  alt="Finance"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 right-3 bg-[#0F2A4A] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  Finance
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Finance</h3>
                <ul className="space-y-2.5 text-xs text-slate-650 dark:text-slate-300 font-medium">
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Virtual CFO Services</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Financial Planning & Analysis (FP&A)</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Budget & Cost Management</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Reporting & MIS</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-6 pt-0">
              <button
                onClick={() => handleTabChange('services')}
                className="w-full py-3 rounded-xl bg-[#0F2A4A] hover:bg-[#0A1D34] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>View Category</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category 2: Growth */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-[0_16px_32px_-8px_rgba(15,42,74,0.08)] transition-all duration-300">
            <div>
              {/* Card Banner Image */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
                  alt="Growth"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 right-3 bg-[#0F2A4A] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  Growth
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-905 dark:text-white mb-4">Growth</h3>
                <ul className="space-y-2.5 text-xs text-slate-655 dark:text-slate-300 font-medium">
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>CGTMSE & Working Capital Loans</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>LAP OD Limit (Loan Against Property)</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Unsecured Business & Personal Loans</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Cash Credit / Overdraft (OD) Limits</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-6 pt-0">
              <button
                onClick={() => handleTabChange('services')}
                className="w-full py-3 rounded-xl bg-[#0F2A4A] hover:bg-[#0A1D34] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>View Category</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category 3: Security */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-[0_16px_32px_-8px_rgba(15,42,74,0.08)] transition-all duration-300">
            <div>
              {/* Card Banner Image */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"
                  alt="Security"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 right-3 bg-[#0F2A4A] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  Security
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-905 dark:text-white mb-4">Security</h3>
                <ul className="space-y-2.5 text-xs text-slate-655 dark:text-slate-300 font-medium">
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>AI Audit & Cybersecurity Certification</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Global Data Privacy (GDPR) Compliance</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>SOC Certification (Type 1 & Type 2)</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>HIPAA Compliance & Risk Mitigation</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-6 pt-0">
              <button
                onClick={() => handleTabChange('services')}
                className="w-full py-3 rounded-xl bg-[#0F2A4A] hover:bg-[#0A1D34] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>View Category</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default ProviderOverview;
