import React from 'react';
import {
  UserCheck,
  FileText,
  Sparkles,
  CreditCard,
  PenTool,
  Store,
  Award,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const ProviderProfile = ({
  partnerData,
  providerCredentials,
  bankDetails,
  listedServices,
  checklistState,
  aiProfileCompleted,
  agreementSigned,
  setIsCredentialsModalOpen,
  setIsBankModalOpen,
  setIsAgreementOpen,
  setIsAIModalOpen,
  handleTabChange
}) => {
  // Resolve actual states including AI status
  const profileCompleted = checklistState?.profileCompleted || false;
  const bankLinked = checklistState?.bankLinked || false;
  const servicePublished = checklistState?.servicePublished || false;
  const actualAgreementSigned = agreementSigned || checklistState?.agreementSigned || false;

  // Checklist configuration
  const steps = [
    {
      id: 1,
      title: "Account Registration",
      desc: `Your account is verified and authenticated under ${partnerData?.email || 'email'}.`,
      completed: true,
      icon: UserCheck,
      action: null
    },
    {
      id: 2,
      title: "Complete Profile Credentials",
      desc: "Provide legal name, consulting firm experience, and expertise domains.",
      completed: profileCompleted,
      icon: FileText,
      action: () => setIsCredentialsModalOpen(true),
      actionLabel: "Setup Credentials",
      details: profileCompleted && providerCredentials
        ? `Registered: ${providerCredentials.legalName} • ${providerCredentials.firmName} (${providerCredentials.experience} yrs exp)`
        : null
    },
    {
      id: 3,
      title: "AI Profile Optimizer",
      desc: "Use AI models to draft, structure, and polish your consulting profile biography.",
      completed: aiProfileCompleted,
      icon: Sparkles,
      action: () => setIsAIModalOpen(true),
      actionLabel: "Optimize with AI",
      details: aiProfileCompleted ? "AI optimized biography added successfully" : null
    },
    {
      id: 4,
      title: "Link Payment Details",
      desc: "Connect your bank account to secure consulting payouts instantly.",
      completed: bankLinked,
      icon: CreditCard,
      action: () => setIsBankModalOpen(true),
      actionLabel: "Link Payout Info",
      details: bankLinked && bankDetails
        ? `Bank: ${bankDetails.bankName} • Acc: ****${bankDetails.accountNo?.slice(-4)}`
        : null
    },
    {
      id: 5,
      title: "Sign Partner Agreement",
      desc: "Digitally sign standard advisory network terms and guidelines.",
      completed: actualAgreementSigned,
      icon: PenTool,
      action: () => setIsAgreementOpen(true),
      actionLabel: "Sign Agreement",
      details: actualAgreementSigned
        ? `Digitally signed as ${partnerData?.agreementSignedName || partnerData?.firstName}`
        : null
    },
    {
      id: 6,
      title: "Publish First Consulting Offer",
      desc: "Publish at least one strategy consulting package to start receiving client bookings.",
      completed: servicePublished,
      icon: Store,
      action: () => handleTabChange('services'),
      actionLabel: "Create Offering",
      details: servicePublished && listedServices
        ? `Live offerings: ${listedServices.length} packages published`
        : null
    }
  ];

  // Dynamically find next incomplete step
  const nextStep = steps.find(s => !s.completed);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Left: Verification status and checklist */}
      <div className="lg:col-span-8 space-y-6">
        {/* Onboarding Checklist Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-1.5 h-6 bg-[#E52E38] rounded-full"></div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E52E38]">
                Onboarding Guide
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Profile Onboarding Setup
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Follow the step-by-step setup to complete your profile verification.
            </p>
          </div>

          <div className="space-y-4">
            {steps.map((step) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`p-4 rounded-2xl border flex items-start space-x-4 transition-all ${
                    step.completed
                      ? 'border-slate-200/50 bg-slate-50/50'
                      : nextStep?.id === step.id
                      ? 'border-[#E52E38] bg-white shadow-sm'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {/* Circular icon container */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-colors ${
                      step.completed
                        ? 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                        : nextStep?.id === step.id
                        ? 'bg-[#E52E38]/10 text-[#E52E38] border border-[#E52E38]/20'
                        : 'bg-slate-50 text-slate-500 border border-slate-200'
                    }`}
                  >
                    <StepIcon className="w-4.5 h-4.5" />
                  </div>

                  <div className="flex-grow">
                    <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                      <span>
                        {step.id}. {step.title}
                      </span>
                      {step.completed && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-bold uppercase">
                          Done
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium leading-relaxed">
                      {step.desc}
                    </p>
                    {step.details && (
                      <div className="mt-2 text-[11px] font-bold text-slate-700 bg-slate-100/55 px-3 py-1.5 rounded-lg inline-block">
                        {step.details}
                      </div>
                    )}
                    {!step.completed && step.action && (
                      <button
                        onClick={step.action}
                        className="mt-2.5 px-4 py-1.5 rounded-lg bg-[#0F2A4A] hover:bg-[#0A1D34] text-white font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-colors shadow-xs"
                      >
                        {step.actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: AI Profile, Profile Details, & Next Action */}
      <div className="lg:col-span-4 space-y-6">
        {/* Credentials Info card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 hover:shadow-[0_16px_32px_-8px_rgba(15,42,74,0.08)] transition-all duration-300">
          <h3 className="text-lg font-black text-slate-900 mb-2">Profile Overview</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#0F2A4A] text-white flex items-center justify-center font-black text-sm uppercase">
              {partnerData?.firstName?.slice(0, 1)}
              {partnerData?.lastName?.slice(0, 1)}
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">
                {partnerData?.firstName} {partnerData?.lastName}
              </h4>
              <p className="text-[11px] text-slate-500">{partnerData?.email}</p>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-4 space-y-2 text-xs font-semibold text-slate-600">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-emerald-600 font-bold">Active Account</span>
            </div>
            <div className="flex justify-between">
              <span>Contact Phone:</span>
              <span>{partnerData?.phone || 'Not Completed'}</span>
            </div>
            <div className="flex justify-between">
              <span>Location:</span>
              <span>
                {partnerData?.city}, {partnerData?.country}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Next Step card */}
        {nextStep && (
          <div className="bg-white rounded-3xl p-6 border border-[#E52E38]/30 shadow-[0_12px_24px_-8px_rgba(229,46,56,0.08)] space-y-4 hover:shadow-md transition-all duration-300 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-[#E52E38]/5 rounded-bl-full shrink-0 -z-1" />
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#E52E38]" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Next Action Required
              </h3>
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-[#0F2A4A]">
                {nextStep.id}. {nextStep.title}
              </h4>
              <p className="text-[11px] text-slate-550 font-medium leading-relaxed mt-1">
                {nextStep.desc}
              </p>
            </div>
            {nextStep.action && (
              <button
                onClick={nextStep.action}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#E52E38] to-[#0F2A4A] hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <span>{nextStep.actionLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* AI Profile status card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 hover:shadow-[0_16px_32px_-8px_rgba(15,42,74,0.08)] transition-all duration-300">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#E52E38]" />
            <h3 className="text-md font-black text-slate-900">AI Profile Optimizer</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Optimized credentials help double client matches. Let AI help draft your expert
            biography.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsAIModalOpen(true)}
              className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all cursor-pointer ${
                aiProfileCompleted
                  ? 'bg-emerald-500 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#E52E38] to-[#0F2A4A] hover:opacity-90'
              }`}
              disabled={aiProfileCompleted}
            >
              {aiProfileCompleted ? 'AI Profile Completed ✓' : 'Start AI Profile Builder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;
