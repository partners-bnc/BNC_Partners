import React from 'react';

const ConsumerInvoices = ({ clientInvoices, handlePayInvoice }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Payments & Invoices</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Keep track of payments, audit retainers, and consultations billings.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-2">Invoice ID</th>
              <th className="py-3 px-2">Date</th>
              <th className="py-3 px-2">Description</th>
              <th className="py-3 px-2 text-right">Amount</th>
              <th className="py-3 px-2 text-center">Status</th>
              <th className="py-3 px-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300">
            {clientInvoices.map(inv => (
              <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                <td className="py-4 px-2 font-mono text-slate-500">{inv.id}</td>
                <td className="py-4 px-2 text-slate-500">{inv.date}</td>
                <td className="py-4 px-2 font-bold text-slate-900 dark:text-white">{inv.description}</td>
                <td className="py-4 px-2 text-right font-black text-slate-900 dark:text-white">${inv.amount.toLocaleString()}.00</td>
                <td className="py-4 px-2 text-center">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                    inv.status === 'Paid'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                      : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td className="py-4 px-2 text-right">
                  {inv.status === 'Unpaid' ? (
                    <button
                      onClick={() => handlePayInvoice(inv.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#E52E38] hover:bg-red-700 text-white text-[10px] font-extrabold uppercase tracking-wider cursor-pointer"
                    >
                      Pay Invoice
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400">Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConsumerInvoices;
