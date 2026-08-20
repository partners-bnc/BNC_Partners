import React from 'react';

const ConsumerSettings = ({ clientSettings, handleClientSettingsSubmit }) => {
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Client Profile Settings</h2>
        <p className="text-xs text-slate-500 font-medium">Customize your organizational profile and budget preferences.</p>
      </div>

      <form onSubmit={handleClientSettingsSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Authorized Contact Person</label>
          <input
            type="text"
            name="legalName"
            defaultValue={clientSettings.legalName}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Company / Organization Name</label>
            <input
              type="text"
              name="companyName"
              defaultValue={clientSettings.companyName}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
            <input
              type="text"
              name="phone"
              defaultValue={clientSettings.phone}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Company Size</label>
            <select name="companySize" defaultValue={clientSettings.companySize} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs">
              <option>1-10 employees</option>
              <option>11-50 employees</option>
              <option>51-200 employees</option>
              <option>200+ employees</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Project Budget</label>
            <select name="budgetRange" defaultValue={clientSettings.budgetRange} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs">
              <option>$1,000 - $5,000</option>
              <option>$5,000 - $10,000</option>
              <option>$10,000 - $50,000</option>
              <option>$50,000+</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Primary Need</label>
            <select name="helpNeeded" defaultValue={clientSettings.helpNeeded} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs">
              <option>Finance</option>
              <option>Growth Capital</option>
              <option>Cybersecurity</option>
              <option>Tax Strategy</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-[#0F2A4A] hover:bg-[#0A1D34] text-white font-extrabold text-xs uppercase tracking-wider shadow-md mt-4 cursor-pointer"
        >
          Save Preferences & Update Settings
        </button>
      </form>
    </div>
  );
};

export default ConsumerSettings;
