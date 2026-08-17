import React from 'react';

const ProviderCalendar = ({ providerConsultations, setProviderConsultations }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-1.5 h-7 bg-[#E52E38] rounded-full"></div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Consultation Calendar</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Keep track of your scheduled corporate sessions.</p>
          </div>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-850 px-3 py-1.5 rounded-lg shrink-0">Month View</span>
      </div>

      <div className="space-y-4">
        {providerConsultations.map((c) => (
          <div key={c.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-350 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#0F2A4A] text-white flex flex-col items-center justify-center shrink-0 font-bold">
                <span className="text-[9px] uppercase tracking-wider">{c.date.split(' ')[0]}</span>
                <span className="text-lg font-black leading-none">{c.date.split(' ')[1].replace(',', '')}</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{c.client}</h3>
                <p className="text-xs text-slate-550 dark:text-slate-400">{c.service} • {c.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={c.link}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg bg-[#0F2A4A] text-white text-xs font-bold hover:bg-[#0A1D34] transition-all cursor-pointer"
              >
                Launch Meet Call
              </a>
              <button
                onClick={() => {
                  if (confirm('Cancel this consultation booking?')) {
                    setProviderConsultations(prev => prev.filter(item => item.id !== c.id));
                  }
                }}
                className="px-4 py-2 rounded-lg border border-red-200 text-[#E52E38] text-xs font-bold hover:bg-red-50 transition-all cursor-pointer"
              >
                Cancel Call
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProviderCalendar;
