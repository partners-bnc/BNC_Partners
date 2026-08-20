import React from 'react';

const ConsumerBookings = ({ clientBookings, setClientBookings }) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">My Booked Consultations</h2>
        <p className="text-xs text-slate-500 font-medium">View scheduled sessions and connect with matched experts.</p>
      </div>

      <div className="space-y-4">
        {clientBookings.map(b => (
          <div key={b.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0F2A4A] text-white flex items-center justify-center font-bold text-sm uppercase">
                {b.expert.slice(0,2)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{b.expert}</h4>
                <p className="text-xs text-slate-500">{b.service}</p>
                <p className="text-xs text-[#E52E38] font-bold mt-0.5">{b.date} at {b.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">{b.status}</span>
              <button
                onClick={() => {
                  if (confirm('Cancel this booking call?')) {
                    setClientBookings(prev => prev.filter(item => item.id !== b.id));
                  }
                }}
                className="px-3.5 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConsumerBookings;
