import React, { useState } from 'react';
import { HelpCircle, CheckCircle2 } from 'lucide-react';
import { createServiceRequest } from '../../lib/supabaseData';

const ServiceRequestCard = ({ partnerData }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      setStatus('loading');
      setErrorMessage('');
      await createServiceRequest(partnerData?.id, title, description);
      setStatus('success');
      setTitle('');
      setDescription('');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (err) {
      console.error('Error submitting service request:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to submit request');
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col space-y-4">
      <div className="flex items-center gap-2.5">
        <HelpCircle className="w-5 h-5 text-slate-800 shrink-0" />
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Request Custom Service
        </h2>
      </div>
      
      <p className="text-xs text-slate-500 font-medium">
        Don't see what you're looking for? Suggest a new service and our team will review your request.
      </p>

      {status === 'success' ? (
        <div className="flex flex-col items-center justify-center p-6 text-emerald-600 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2 animate-fade-in">
          <CheckCircle2 className="w-8 h-8" />
          <p className="text-sm font-bold text-center">Request Submitted!</p>
          <p className="text-xs text-emerald-600/80 text-center">We will get back to you soon.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
              Service Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. specialized tax consulting"
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:border-[#E52E38] focus:ring-1 focus:ring-[#E52E38] outline-none transition-all placeholder:text-slate-400"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe what you need..."
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:border-[#E52E38] focus:ring-1 focus:ring-[#E52E38] outline-none transition-all placeholder:text-slate-400 resize-none min-h-[80px]"
              required
            />
          </div>
          
          {status === 'error' && (
            <p className="text-xs text-red-500 font-medium">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-3 rounded-xl bg-[#0F2A4A] hover:bg-[#0A1D34] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-70 flex justify-center items-center cursor-pointer"
          >
            {status === 'loading' ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Submit Request'
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ServiceRequestCard;
