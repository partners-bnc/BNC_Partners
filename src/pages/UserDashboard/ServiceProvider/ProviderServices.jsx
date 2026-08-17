import React from 'react';
import { Plus, X } from 'lucide-react';

const getCategoryImg = (category) => {
  switch (category?.toLowerCase()) {
    case 'finance':
      return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80';
    case 'growth':
      return 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';
    case 'security':
      return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80';
    default:
      return 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80';
  }
};

const ProviderServices = ({
  listedServices,
  setListedServices,
  isCreateServiceOpen,
  setIsCreateServiceOpen,
  handleCreateServiceSubmit
}) => {
  return (
    <div className="space-y-6 animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Red vertical bar header layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-1.5 h-7 bg-[#E52E38] rounded-full"></div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Manage Listed Services</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Create and publish corporate services to clients.</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreateServiceOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#E52E38] hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>List New Service</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {listedServices.map((service) => (
          <div
            key={service.id}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-[0_16px_32px_-8px_rgba(15,42,74,0.08)] transition-all duration-300"
          >
            <div>
              {/* Category banner image overlay */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={getCategoryImg(service.category)}
                  alt={service.category}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 right-3 bg-[#0F2A4A] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  {service.category}
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    {service.title}
                  </h3>
                  <span className="text-xs font-black text-[#E52E38] shrink-0 ml-2">
                    ${service.price} / {service.unit}
                  </span>
                </div>

                <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-medium">
                  {service.description}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-2">
              <button
                onClick={() => {
                  if (confirm('Delete this service listing?')) {
                    setListedServices(prev => prev.filter(s => s.id !== service.id));
                  }
                }}
                className="w-full py-2.5 rounded-xl border border-red-200 text-[#E52E38] hover:bg-red-50 text-xs font-bold transition-all text-center cursor-pointer"
              >
                Delete Listing
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Publish New Service Modal */}
      {isCreateServiceOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button onClick={() => setIsCreateServiceOpen(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-bold tracking-widest text-[#E52E38] uppercase">SERVICE LISTING</span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1 mb-2">Publish New Service</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-semibold">List a new consultation or strategy package for clients.</p>

            <form onSubmit={handleCreateServiceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Service Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Virtual CFO & FP&A Review"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select name="category" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs">
                    <option>Finance</option>
                    <option>Growth</option>
                    <option>Security</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Retainer ($)</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="300"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#E52E38] mb-1">Unit</label>
                  <select name="unit" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs">
                    <option>hr</option>
                    <option>session</option>
                    <option>plan</option>
                    <option>retainer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Service Description</label>
                <textarea
                  name="description"
                  placeholder="Detail the scope, delivery, and outcome of this consulting package..."
                  rows={3}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <button type="submit" className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#0F2A4A] hover:bg-[#0A1D34] transition-all shadow-md mt-2 cursor-pointer">
                Publish Service Package
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderServices;
