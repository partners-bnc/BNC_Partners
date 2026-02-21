import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaUser, FaBriefcase } from 'react-icons/fa';

const ReferralModal = ({ isOpen, onClose, partnerData }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [referralType, setReferralType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    jobRole: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const referralData = {
      referrerEmail: partnerData?.email,
      referralType,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      ...(referralType === 'client' && { service: formData.service }),
      ...(referralType === 'candidate' && { jobRole: formData.jobRole })
    };
    
    console.log('Referral submitted:', referralData);
    alert(t('referral.success'));
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setReferralType('');
    setFormData({
      name: '',
      phone: '',
      email: '',
      service: '',
      jobRole: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full border-2 border-gray-300">
        <div className="p-6 border-b bg-[#2C5AA0] text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">{t('referral.title')}</h2>
              <p className="text-blue-100 text-sm">{t('referral.subtitle')}</p>
            </div>
            <button onClick={handleClose} className="text-blue-100 hover:text-white">
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!referralType ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('referral.chooseType')}</h3>
              
              <button
                onClick={() => setReferralType('client')}
                className={`w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#2C5AA0] hover:bg-blue-50 transition-colors ${isRtl ? 'text-right' : 'text-left'}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FaUser className="h-5 w-5 text-[#2C5AA0]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{t('referral.type.client.title')}</h4>
                    <p className="text-sm text-gray-600">{t('referral.type.client.description')}</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setReferralType('candidate')}
                className={`w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#2C5AA0] hover:bg-blue-50 transition-colors ${isRtl ? 'text-right' : 'text-left'}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FaBriefcase className="h-5 w-5 text-[#2C5AA0]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{t('referral.type.candidate.title')}</h4>
                    <p className="text-sm text-gray-600">{t('referral.type.candidate.description')}</p>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {referralType === 'client' ? t('referral.form.clientTitle') : t('referral.form.candidateTitle')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setReferralType('')}
                    className="text-sm text-[#2C5AA0] hover:underline"
                  >
                    {t('referral.form.back')}
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('referral.form.name')}</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2C5AA0] focus:border-[#2C5AA0]"
                    placeholder={t('referral.form.placeholders.name')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('referral.form.phone')}</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2C5AA0] focus:border-[#2C5AA0]"
                    placeholder={t('referral.form.placeholders.phone')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('referral.form.email')}</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2C5AA0] focus:border-[#2C5AA0]"
                    placeholder={t('referral.form.placeholders.email')}
                  />
                </div>

                {referralType === 'client' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('referral.form.service')}</label>
                    <select
                      required
                      value={formData.service}
                      onChange={(e) => setFormData(prev => ({ ...prev, service: e.target.value }))}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2C5AA0] focus:border-[#2C5AA0]"
                    >
                      <option value="">{t('referral.form.selectService')}</option>
                      <option value="cyber-security">{t('referral.services.cyberSecurity')}</option>
                      <option value="data-privacy">{t('referral.services.dataPrivacy')}</option>
                      <option value="internal-audit">{t('referral.services.internalAudit')}</option>
                      <option value="finance-advisory">{t('referral.services.financeAdvisory')}</option>
                      <option value="compliance">{t('referral.services.compliance')}</option>
                      <option value="other">{t('referral.services.other')}</option>
                    </select>
                  </div>
                )}

                {referralType === 'candidate' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('referral.form.jobRole')}</label>
                    <input
                      type="text"
                      required
                      value={formData.jobRole}
                      onChange={(e) => setFormData(prev => ({ ...prev, jobRole: e.target.value }))}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2C5AA0] focus:border-[#2C5AA0]"
                      placeholder={t('referral.form.placeholders.jobRole')}
                    />
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-[#2C5AA0] hover:text-[#2C5AA0]"
                  >
                    {t('referral.form.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#2C5AA0] text-white rounded-lg hover:bg-blue-700"
                  >
                    {t('referral.form.submit')}
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

export default ReferralModal;
