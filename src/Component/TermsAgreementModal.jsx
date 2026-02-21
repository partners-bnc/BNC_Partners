import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaFileSignature } from 'react-icons/fa';

const TermsAgreementModal = ({ isOpen, onClose, partnerData, onSubmitted }) => {
  const { t, i18n } = useTranslation();
  const [signatureName, setSignatureName] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');

  const fullName = useMemo(() => {
    const first = partnerData?.firstName || '';
    const last = partnerData?.lastName || '';
    return `${first} ${last}`.trim() || 'Partner';
  }, [partnerData?.firstName, partnerData?.lastName]);

  const email = partnerData?.email || 'N/A';
  const dateText = useMemo(
    () => new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    [i18n.language, isOpen]
  );

  const resetForm = () => {
    setSignatureName('');
    setAccepted(false);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = signatureName.trim();
    if (!trimmed) {
      setError(t('termsAgreement.errors.signatureRequired'));
      return;
    }
    if (!accepted) {
      setError(t('termsAgreement.errors.acceptRequired'));
      return;
    }
    setError('');
    onSubmitted({ signedName: trimmed, signedAt: new Date().toISOString() });
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#2C5AA0] flex items-center justify-center">
              <FaFileSignature className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-poppins text-xl font-semibold text-slate-900">{t('termsAgreement.title')}</h2>
              <p className="text-sm text-slate-500">{t('termsAgreement.subtitle')}</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="max-h-64 overflow-y-auto text-sm text-slate-600 leading-relaxed pr-3">
            <p className="font-poppins text-lg font-semibold text-slate-900 mb-3">{t('termsAgreement.summaryTitle')}</p>
            <ul className="space-y-2">
              {t('termsAgreement.summaryItems', { returnObjects: true }).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid gap-6 sm:grid-cols-[1.2fr_1fr] items-start">
              <div className="space-y-2 text-sm text-slate-700">
                <div className="font-medium text-slate-900">{fullName}</div>
                <div className="text-slate-900">{email}</div>
                <div className="text-slate-900">{dateText}</div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-900 mb-2">{t('termsAgreement.eSignatureLabel')}</label>
                <input
                  type="text"
                  value={signatureName}
                  onChange={(event) => setSignatureName(event.target.value)}
                  placeholder={t('termsAgreement.eSignaturePlaceholder')}
                  className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-900 placeholder:text-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
                />
              </div>
            </div>

            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#2C5AA0] focus:ring-[#2C5AA0]"
              />
              <span>{t('termsAgreement.acceptText')}</span>
            </label>

            {error && <p className="text-sm text-rose-600">{error}</p>}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                {t('termsAgreement.cancel')}
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-[#2C5AA0] to-[#1e3a8a] text-white font-semibold shadow-sm hover:shadow-md"
              >
                {t('termsAgreement.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TermsAgreementModal;
