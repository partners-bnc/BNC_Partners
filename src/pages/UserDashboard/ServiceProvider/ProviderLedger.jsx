import React from 'react';

const ProviderLedger = ({ providerTransactions }) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-1.5 h-7 bg-[#E52E38] rounded-full"></div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Payout & Transaction Ledger</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Complete record of payouts earned on consultancy mandates.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              <th className="py-3.5 px-3">Transaction ID</th>
              <th className="py-3.5 px-3">Date</th>
              <th className="py-3.5 px-3">Client</th>
              <th className="py-3.5 px-3">Service</th>
              <th className="py-3.5 px-3 text-right">Amount</th>
              <th className="py-3.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
            {providerTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-3 font-mono text-slate-500">{tx.id}</td>
                <td className="py-4 px-3 text-slate-500">{tx.date}</td>
                <td className="py-4 px-3 font-bold text-slate-900">{tx.client}</td>
                <td className="py-4 px-3">{tx.service}</td>
                <td className="py-4 px-3 text-right font-black text-slate-900">${tx.amount.toLocaleString()}.00</td>
                <td className="py-4 px-3 text-center">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProviderLedger;
