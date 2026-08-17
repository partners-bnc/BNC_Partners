import React from 'react';
import { Search, CheckCircle2, X, ArrowRight } from 'lucide-react';

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

const ConsumerDirectory = ({
  exploreSearch,
  setExploreSearch,
  exploreCategory,
  setExploreCategory,
  filteredDirectory,
  selectedServiceToBook,
  setSelectedServiceToBook,
  isBookModalOpen,
  setIsBookModalOpen,
  handleBookServiceSubmit
}) => {
  return (
    <div className="space-y-6 animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Category Filter and Search Panel */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Finance', 'Growth', 'Security'].map(cat => (
            <button
              key={cat}
              onClick={() => setExploreCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                exploreCategory === cat
                  ? 'bg-[#E52E38] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80 font-medium">
          <input
            type="text"
            placeholder="Search service details..."
            value={exploreSearch}
            onChange={(e) => setExploreSearch(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-[#E52E38]/20 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
        </div>
      </div>

      {/* Directory Cards Grid (Matching reference visual layouts) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredDirectory.map(service => (
          <div
            key={service.id}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-[0_16px_32px_-8px_rgba(15,42,74,0.08)] transition-all duration-300"
          >
            <div>
              {/* Card Banner Image overlay */}
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    {service.title}
                  </h3>
                  <span className="text-xs font-black text-[#E52E38] shrink-0 ml-2">
                    ${service.price} / {service.unit}
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-650 dark:text-slate-300 font-medium">
                  {service.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-center space-x-2.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => {
                  setSelectedServiceToBook(service);
                  setIsBookModalOpen(true);
                }}
                className="w-full py-3 rounded-xl bg-[#0F2A4A] hover:bg-[#0A1D34] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Book Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Book Consultation Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button onClick={() => { setIsBookModalOpen(false); setSelectedServiceToBook(null); }} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-bold tracking-widest text-[#E52E38] uppercase">BOOK APPOINTMENT</span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1 mb-2">Book Consultation Call</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-semibold">Schedule a strategy meeting for service: <strong>{selectedServiceToBook?.title}</strong></p>

            <form onSubmit={handleBookServiceSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Date</label>
                  <input
                    type="date"
                    name="date"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-650"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Time</label>
                  <select name="time" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs">
                    <option>09:00 AM</option>
                    <option>10:00 AM</option>
                    <option>11:30 AM</option>
                    <option>02:00 PM</option>
                    <option>03:30 PM</option>
                    <option>05:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Partner / Agency</label>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
                  BNC Advisory Network Consultant (${selectedServiceToBook?.price} / {selectedServiceToBook?.unit})
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Add Specific Goals / Notes</label>
                <textarea
                  name="notes"
                  placeholder="Detail any specifics you want to address during this scheduled consultation call..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <button type="submit" className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#0F2A4A] hover:bg-[#0A1D34] transition-all shadow-md mt-2 cursor-pointer">
                Confirm Call Booking & Reserve Slot
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumerDirectory;
