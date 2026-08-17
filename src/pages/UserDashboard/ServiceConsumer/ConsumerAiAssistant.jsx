import React from 'react';
import { Mic, CheckCircle } from 'lucide-react';

const ConsumerAiAssistant = ({
  aiMatchMessage,
  setAiMatchMessage,
  isAiMatching,
  matchedExpertResult,
  handleVoiceRequirementSubmit,
  setIsRequirementModalOpen
}) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E52E38]">AI Matchmaker</span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Instantly Map Your Mandate</h2>
          <p className="text-xs text-slate-500 max-w-lg mx-auto font-medium">
            Describe your requirements using voice or typing. Our LLM matching pipeline connects you with verified global experts.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Type Your Requirements</label>
            <textarea
              placeholder="e.g. We are an enterprise firm looking for a Virtual CFO to structure our tax audits and run cost optimization reviews..."
              rows={4}
              value={aiMatchMessage}
              onChange={(e) => setAiMatchMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-[#E52E38]/20 focus:outline-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => handleVoiceRequirementSubmit(aiMatchMessage)}
              disabled={isAiMatching || !aiMatchMessage.trim()}
              className="w-full sm:flex-1 py-3.5 rounded-xl bg-[#E52E38] hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isAiMatching ? 'Processing Match...' : 'Find Matches & Book Call'}
            </button>
            
            <button
              onClick={() => setIsRequirementModalOpen(true)}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mic className="w-4 h-4 text-[#E52E38]" />
              <span>Record Audio</span>
            </button>
          </div>
        </div>

        {isAiMatching && (
          <div className="pt-6 border-t border-slate-100 text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E52E38] mx-auto"></div>
            <p className="text-xs font-bold text-slate-500">Scanning our certified global partner registry...</p>
          </div>
        )}

        {matchedExpertResult && (
          <div className="pt-6 border-t border-slate-100 space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-4">
              <CheckCircle className="w-8 h-8 text-emerald-500 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-emerald-800">Match Found & Consultation Confirmed!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  We mapped your mandate to: <strong>{matchedExpertResult.name}</strong> ({matchedExpertResult.domain}). 
                  A Google Meet consultation call has been automatically scheduled.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0F2A4A] text-white flex items-center justify-center font-bold text-sm">
                  {matchedExpertResult.name.slice(0,2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{matchedExpertResult.name}</h4>
                  <p className="text-[11px] text-slate-500">{matchedExpertResult.firm} • Rating {matchedExpertResult.rating}★</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumerAiAssistant;
