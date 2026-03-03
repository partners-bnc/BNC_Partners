import React, { useEffect, useState } from 'react';
import bncLogo from '../assets/bnc.svg';
import { getSessionUser, submitExpertRequest } from '../lib/supabaseData';

const ExpertFormModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    mobile: '',
    requirement: '',
    framework: ''
  });
  const [isSessionUser, setIsSessionUser] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const hydrateForm = async () => {
      setSubmitError('');
      setIsSubmitted(false);

      try {
        const user = await getSessionUser();
        if (!isMounted) return;

        if (user?.email) {
          setIsSessionUser(true);
          setFormData((prev) => ({
            ...prev,
            email: user.email || prev.email
          }));
        } else {
          setIsSessionUser(false);
        }

        try {
          const stored = localStorage.getItem('partnerUser');
          if (!stored) return;
          const parsed = JSON.parse(stored);
          const fullName = `${parsed?.firstName || ''} ${parsed?.lastName || ''}`.trim();
          setFormData((prev) => ({
            ...prev,
            name: fullName || prev.name,
            mobile: parsed?.phone || prev.mobile
          }));
        } catch (error) {
          console.error('Failed to parse partner user data:', error);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Session check failed:', error);
        setIsSessionUser(false);
      }
    };

    hydrateForm();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');
    try {
      await submitExpertRequest(formData);
      setIsSubmitted(true);
      setFormData((prev) => ({
        ...prev,
        company: '',
        mobile: '',
        requirement: '',
        framework: '',
        email: isSessionUser ? prev.email : ''
      }));
    } catch (error) {
      console.error('Failed to submit expert request:', error);
      setSubmitError(error?.message || 'Could not submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-0">
      <div className="bg-white w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl flex flex-col relative">
        <div className="p-6 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2 text-[#224491] font-bold tracking-wide">
            <img src={bncLogo} alt="BNC Logo" className="h-8 w-auto" />
            <span>BNC Global</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 sm:p-12 flex-1">
          {isSubmitted ? (
            <div className="max-w-md mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Request submitted</h2>
              <p className="text-gray-500 mb-8">
                Your request was saved successfully. Our team will contact you soon.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 bg-[#224491] text-white font-medium rounded-lg hover:bg-[#142c64] transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center sm:text-left">Book a Consultation</h2>
              <p className="text-gray-500 mb-8 text-center sm:text-left">
                Fill in your details below. It will only take a minute.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="p-6 border border-gray-100 rounded-xl bg-gray-50/50 space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Personal Details</h3>

                  <div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Full Name"
                      className="w-full bg-transparent border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#224491] placeholder-gray-400 outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Company Name"
                      className="w-full bg-transparent border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#224491] placeholder-gray-400 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="p-6 border border-gray-100 rounded-xl bg-gray-50/50 space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Contacts</h3>

                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email Address"
                      className="flex-1 bg-transparent border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#224491] placeholder-gray-400 outline-none transition-colors"
                      required
                      readOnly={isSessionUser}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="Mobile Number"
                      className="flex-1 bg-transparent border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#224491] placeholder-gray-400 outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="p-6 border border-gray-100 rounded-xl bg-gray-50/50 space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Requirement Details</h3>

                  <div>
                    <input
                      type="text"
                      name="framework"
                      value={formData.framework}
                      onChange={handleChange}
                      placeholder="Preferred Framework"
                      className="w-full bg-transparent border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#224491] placeholder-gray-400 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <textarea
                      name="requirement"
                      value={formData.requirement}
                      onChange={handleChange}
                      placeholder="Tell us about your requirement..."
                      rows={3}
                      className="w-full bg-transparent border-0 border-b border-gray-300 px-0 py-2 focus:ring-0 focus:border-[#224491] placeholder-gray-400 outline-none transition-colors resize-none"
                      required
                    />
                  </div>
                </div>

                {submitError && (
                  <p className="text-sm text-red-600">{submitError}</p>
                )}

                <div className="pt-4 flex justify-center sm:justify-start">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-[#224491] text-white font-medium rounded-lg hover:bg-[#142c64] transition-colors flex items-center gap-2 disabled:opacity-60"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Details'}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpertFormModal;
