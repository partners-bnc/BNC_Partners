import React, { useEffect, useRef, useState } from 'react';
import {
  FaTimes,
  FaUserTie,
  FaUserCheck,
  FaUsers,
  FaShieldAlt,
  FaUserShield,
  FaClipboardCheck,
  FaFileAlt,
  FaLeaf,
  FaChartLine,
  FaBalanceScale,
  FaUsersCog,
  FaCalculator,
  FaProjectDiagram,
  FaChalkboardTeacher,
  FaEllipsisH,
  FaLandmark,
  FaHospital,
  FaBuilding,
  FaGraduationCap,
  FaShoppingCart,
  FaUniversity,
  FaHandsHelping,
  FaUmbrellaBeach,
  FaIndustry,
  FaBolt,
  FaCogs,
  FaMicrochip,
  FaPhotoVideo,
  FaTruckMoving,
  FaBriefcase,
  FaLayerGroup,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import './AIProfileModal.css';

const AIProfileModal = ({ isOpen, onClose, partnerData, onSubmitted }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const textAlign = isRtl ? 'text-right' : 'text-left';
  const rowDirection = isRtl ? 'flex-row-reverse' : 'flex-row';
  const inputMargin = isRtl ? 'ml-3' : 'mr-3';
  const iconMargin = isRtl ? 'ml-2' : 'mr-2';
  const autoMargin = isRtl ? 'mr-auto' : 'ml-auto';
  const expandMargin = isRtl ? 'mr-6' : 'ml-6';
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [expandedIndustries, setExpandedIndustries] = useState({});
  const otherServiceRef = useRef(null);
  const [formData, setFormData] = useState({
    partnerType: '',
    services: [],
    otherService: '',
    industries: [],
    mainIndustries: [],
    experienceIndustries: [],
    experienceDetails: {},
    bio: ''
  });
  const emptyForm = {
    partnerType: '',
    services: [],
    otherService: '',
    industries: [],
    mainIndustries: [],
    experienceIndustries: [],
    experienceDetails: {},
    bio: ''
  };

  const resetForm = () => {
    setCurrentStep(1);
    setExpandedIndustries({});
    setFormData(emptyForm);
  };

  useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false);
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!formData.services.includes('other')) return;
    if (!otherServiceRef.current) return;
    otherServiceRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    otherServiceRef.current.focus({ preventScroll: true });
  }, [formData.services]);

  const partnerTypeOptions = [
    { value: 'international-partners', label: t('aiProfile.partnerTypes.international'), icon: FaUsers },
    { value: 'sales-partners', label: t('aiProfile.partnerTypes.sales'), icon: FaChartLine },
    { value: 'technology-partners', label: t('aiProfile.partnerTypes.technology'), icon: FaMicrochip },
    { value: 'service-partners', label: t('aiProfile.partnerTypes.service'), icon: FaUserTie }
  ];

  const serviceIcons = {
    'cyber-security': FaShieldAlt,
    'data-privacy': FaUserShield,
    'internal-audit': FaClipboardCheck,
    'sop': FaFileAlt,
    'esg': FaLeaf,
    'ifrs': FaBalanceScale,
    'finance-advisory': FaChartLine,
    'finance-tax-compliance': FaCalculator,
    'manpower-requirement': FaUsersCog,
    'valuation': FaProjectDiagram,
    'virtual-cfo': FaBriefcase,
    'training-provider': FaChalkboardTeacher,
    'other': FaEllipsisH
  };

  const serviceOptions = [
    { id: 'cyber-security', label: t('aiProfile.services.cyberSecurity') },
    { id: 'data-privacy', label: t('aiProfile.services.dataPrivacy') },
    { id: 'internal-audit', label: t('aiProfile.services.internalAudit') },
    { id: 'sop', label: t('aiProfile.services.sop') },
    { id: 'esg', label: t('aiProfile.services.esg') },
    { id: 'ifrs', label: t('aiProfile.services.ifrs') },
    { id: 'finance-advisory', label: t('aiProfile.services.financeAdvisory') },
    { id: 'finance-tax-compliance', label: t('aiProfile.services.financeTaxCompliance') },
    { id: 'manpower-requirement', label: t('aiProfile.services.manpowerRequirement') },
    { id: 'valuation', label: t('aiProfile.services.valuation') },
    { id: 'virtual-cfo', label: t('aiProfile.services.virtualCfo') },
    { id: 'training-provider', label: t('aiProfile.services.trainingProvider') },
    { id: 'other', label: t('aiProfile.services.other') }
  ];

  const industryIcons = {
    'public-services': FaLandmark,
    healthcare: FaHospital,
    'real-estate': FaBuilding,
    education: FaGraduationCap,
    retail: FaShoppingCart,
    finance: FaUniversity,
    social: FaHandsHelping,
    leisure: FaUmbrellaBeach,
    materials: FaIndustry,
    energy: FaBolt,
    industrial: FaCogs,
    technology: FaMicrochip,
    media: FaPhotoVideo,
    transport: FaTruckMoving,
    'business-services': FaBriefcase
  };

  const SubIndustryIcon = FaLayerGroup;

  const experienceIcons = {
    'public-services': FaLandmark,
    healthcare: FaHospital,
    finance: FaUniversity,
    technology: FaMicrochip,
    education: FaGraduationCap,
    retail: FaShoppingCart,
    other: FaEllipsisH
  };

  const industryOptions = [
    {
      id: 'public-services',
      name: t('aiProfile.industries.publicServices.label'),
      subs: t('aiProfile.industries.publicServices.subs', { returnObjects: true })
    },
    {
      id: 'healthcare',
      name: t('aiProfile.industries.healthcare.label'),
      subs: t('aiProfile.industries.healthcare.subs', { returnObjects: true })
    },
    {
      id: 'real-estate',
      name: t('aiProfile.industries.realEstate.label'),
      subs: t('aiProfile.industries.realEstate.subs', { returnObjects: true })
    },
    {
      id: 'education',
      name: t('aiProfile.industries.education.label'),
      subs: t('aiProfile.industries.education.subs', { returnObjects: true })
    },
    {
      id: 'retail',
      name: t('aiProfile.industries.retail.label'),
      subs: t('aiProfile.industries.retail.subs', { returnObjects: true })
    },
    {
      id: 'finance',
      name: t('aiProfile.industries.finance.label'),
      subs: t('aiProfile.industries.finance.subs', { returnObjects: true })
    },
    {
      id: 'social',
      name: t('aiProfile.industries.social.label'),
      subs: t('aiProfile.industries.social.subs', { returnObjects: true })
    },
    {
      id: 'leisure',
      name: t('aiProfile.industries.leisure.label'),
      subs: t('aiProfile.industries.leisure.subs', { returnObjects: true })
    },
    {
      id: 'materials',
      name: t('aiProfile.industries.materials.label'),
      subs: t('aiProfile.industries.materials.subs', { returnObjects: true })
    },
    {
      id: 'energy',
      name: t('aiProfile.industries.energy.label'),
      subs: t('aiProfile.industries.energy.subs', { returnObjects: true })
    },
    {
      id: 'industrial',
      name: t('aiProfile.industries.industrial.label'),
      subs: t('aiProfile.industries.industrial.subs', { returnObjects: true })
    },
    {
      id: 'technology',
      name: t('aiProfile.industries.technology.label'),
      subs: t('aiProfile.industries.technology.subs', { returnObjects: true })
    },
    {
      id: 'media',
      name: t('aiProfile.industries.media.label'),
      subs: t('aiProfile.industries.media.subs', { returnObjects: true })
    },
    {
      id: 'transport',
      name: t('aiProfile.industries.transport.label'),
      subs: t('aiProfile.industries.transport.subs', { returnObjects: true })
    },
    {
      id: 'business-services',
      name: t('aiProfile.industries.businessServices.label'),
      subs: t('aiProfile.industries.businessServices.subs', { returnObjects: true })
    }
  ];

  const experienceIndustryOptions = [
    { id: 'public-services', label: t('aiProfile.experience.publicServices') },
    { id: 'healthcare', label: t('aiProfile.experience.healthcare') },
    { id: 'finance', label: t('aiProfile.experience.finance') },
    { id: 'technology', label: t('aiProfile.experience.technology') },
    { id: 'education', label: t('aiProfile.experience.education') },
    { id: 'retail', label: t('aiProfile.experience.retail') },
    { id: 'other', label: t('aiProfile.experience.other') }
  ];

  const steps = [
    { id: 1, label: t('aiProfile.steps.partnerType.label'), helper: t('aiProfile.steps.partnerType.helper') },
    { id: 2, label: t('aiProfile.steps.services.label'), helper: t('aiProfile.steps.services.helper') },
    { id: 3, label: t('aiProfile.steps.industries.label'), helper: t('aiProfile.steps.industries.helper') },
    { id: 4, label: t('aiProfile.steps.experience.label'), helper: t('aiProfile.steps.experience.helper') },
    { id: 5, label: t('aiProfile.steps.bio.label'), helper: t('aiProfile.steps.bio.helper') }
  ];

  const selectOption = (step, value) => {
    if (step === 1) {
      setFormData(prev => ({ ...prev, partnerType: value }));
    }
  };

  const toggleService = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const toggleMainIndustry = (industry) => {
    setFormData(prev => {
      const isSelected = prev.mainIndustries.includes(industry);
      return {
        ...prev,
        mainIndustries: isSelected
          ? prev.mainIndustries.filter(i => i !== industry)
          : [...prev.mainIndustries, industry]
      };
    });
    setExpandedIndustries(prev => ({
      ...prev,
      [industry]: !prev[industry]
    }));
  };

  const toggleSubIndustry = (industry) => {
    setFormData(prev => ({
      ...prev,
      industries: prev.industries.includes(industry)
        ? prev.industries.filter(i => i !== industry)
        : [...prev.industries, industry]
    }));
  };

  const selectExperienceIndustry = (industry) => {
    setFormData(prev => ({
      ...prev,
      experienceIndustries: prev.experienceIndustries.includes(industry)
        ? prev.experienceIndustries.filter(i => i !== industry)
        : [...prev.experienceIndustries, industry],
      experienceDetails: prev.experienceIndustries.includes(industry)
        ? Object.fromEntries(Object.entries(prev.experienceDetails).filter(([key]) => key !== industry))
        : {
            ...prev.experienceDetails,
            [industry]: prev.experienceDetails[industry] || { years: '', organisationName: '' }
          }
    }));
  };

  const updateExperienceDetail = (industry, field, value) => {
    setFormData(prev => ({
      ...prev,
      experienceDetails: {
        ...prev.experienceDetails,
        [industry]: {
          ...prev.experienceDetails[industry],
          [field]: value
        }
      }
    }));
  };

  const nextQuestion = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const submitInterview = async () => {
    if (isSubmitting) return; // Prevent multiple submissions
    
    setIsSubmitting(true);
    try {
      const servicesValue = formData.services.includes('other') && formData.otherService.trim()
        ? formData.services
            .filter((service) => service !== 'other')
            .concat(`other: ${formData.otherService.trim()}`)
            .join(', ')
        : formData.services.join(', ');

      const params = new URLSearchParams({
        action: 'submitAIProfile',
        email: partnerData?.email,
        partnerType: formData.partnerType,
        services: servicesValue,
        industries: formData.industries.join(', '),
        experienceIndustries: formData.experienceIndustries.join(', '),
        experienceDetails: JSON.stringify(formData.experienceDetails),
        bio: formData.bio
      });
      
      const url = `https://script.google.com/macros/s/AKfycbxFTbVglGTWrOFI0VVjM4NwcQ80kUtuvLhwPPwNw-Vi3OMF3Cn7tzC3cz_iyCzSNY8T9g/exec?${params}`;
      
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors'
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('AI Profile submitted successfully');
        setIsSubmitted(true);
        onSubmitted?.();
        setTimeout(() => {
          resetForm();
          onClose();
        }, 1800);
      } else {
        console.error('AI Profile submission failed:', result.message);
        alert(t('aiProfile.submitFailed'));
      }
    } catch (error) {
      console.error('Error submitting AI Profile:', error);
      alert(t('aiProfile.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.partnerType !== '';
      case 2:
        if (formData.services.length === 0) return false;
        if (formData.services.includes('other')) {
          return formData.otherService.trim() !== '';
        }
        return true;
      case 3: return formData.industries.length > 0;
      case 4:
        if (formData.experienceIndustries.length === 0) return false;
        return formData.experienceIndustries.every(industry => {
          const details = formData.experienceDetails[industry];
          return details && details.years !== '' && details.organisationName.trim() !== '';
        });
      case 5: return formData.bio.trim() !== '';
      default: return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`ai-profile-modal ai-modal-shell max-w-6xl w-full max-h-[90vh] overflow-y-auto ${textAlign}`}>
        <div className={`ai-modal-header flex flex-wrap items-start justify-between gap-4 ${rowDirection}`}>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t('aiProfile.title')}</h2>
            <p className="text-slate-600">{t('aiProfile.subtitle')}</p>
          </div>
          <div className={`${autoMargin} ${textAlign}`}>
            <div className="text-xs text-slate-500">
              <strong>{t('aiProfile.profileIdLabel')}</strong> {partnerData?.email || t('aiProfile.notAvailable')} |{' '}
              <strong>{t('aiProfile.nameLabel')}</strong> {partnerData?.firstName} {partnerData?.lastName}
            </div>
          </div>
          <button onClick={onClose} className="ai-close-btn" aria-label="Close">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="ai-modal-body">
          <aside className="ai-modal-rail">
            <div className="ai-rail-card">
              <div className="ai-rail-title">{t('aiProfile.progressTitle')}</div>
              <div className="ai-rail-steps">
                {steps.map(step => (
                  <div
                    key={step.id}
                    className={`ai-rail-step ${currentStep === step.id ? 'is-active' : ''} ${currentStep > step.id ? 'is-complete' : ''}`}
                  >
                    <div className="ai-rail-badge">{step.id}</div>
                    <div>
                      <div className="ai-rail-label">{step.label}</div>
                      <div className="ai-rail-helper">{step.helper}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="ai-rail-note">
                {t('aiProfile.progressNote')}
              </div>
            </div>
          </aside>

          <section className="ai-modal-content">
            <div className="ai-content-card">
              <div className="ai-content-progress">
                <div className="ai-progress-track">
                  <div
                    className="ai-progress-fill"
                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                  />
                </div>
                <div className="ai-progress-text">
                  {t('aiProfile.stepCount', { current: currentStep, total: steps.length })}
                </div>
              </div>

              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="animate-bounce mb-6">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-10 h-10 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('aiProfile.submittedTitle')}</h3>
                  <p className="text-gray-600 text-lg">{t('aiProfile.submittedSubtitle')}</p>
                </div>
              ) : (
                <div className="ai-step-content">
          {currentStep === 1 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">{t('aiProfile.questions.partnerType')}</h3>
              <div className="space-y-3">
                {partnerTypeOptions.map((option) => {
                  const Icon = option.icon || FaUsers;
                  return (
                    <label key={option.value} className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${rowDirection} ${textAlign}`}>
                      <input
                        type="radio"
                        name="partner-type"
                        value={option.value}
                        checked={formData.partnerType === option.value}
                        onChange={() => selectOption(1, option.value)}
                        className={inputMargin}
                      />
                      <span className={`${iconMargin} text-black`}>
                        <Icon size={18} />
                      </span>
                      <span className="font-semibold">{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">{t('aiProfile.questions.services')}</h3>
              <p className="text-sm text-gray-600 mb-4">{t('aiProfile.multiSelectHint')}</p>
              <div className="grid grid-cols-2 gap-3">
                {serviceOptions.map((service) => {
                  const Icon = serviceIcons[service.id] || FaBriefcase;
                  return (
                    <label key={service.id} className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${rowDirection} ${textAlign}`}>
                      <input
                        type="checkbox"
                        checked={formData.services.includes(service.id)}
                        onChange={() => toggleService(service.id)}
                        className={inputMargin}
                      />
                      <span className={`${iconMargin} text-black`}>
                        <Icon size={18} />
                      </span>
                      <span className="font-semibold">{service.label}</span>
                    </label>
                  );
                })}
              </div>
              {formData.services.includes('other') && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">{t('aiProfile.otherServiceLabel')}</label>
                  <input
                    type="text"
                    ref={otherServiceRef}
                    value={formData.otherService}
                    onChange={(e) => setFormData(prev => ({ ...prev, otherService: e.target.value }))}
                    placeholder={t('aiProfile.otherServicePlaceholder')}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">{t('aiProfile.questions.industries')}</h3>
              <p className="text-sm text-gray-600 mb-4">{t('aiProfile.multiSelectHint')}</p>
              <div className="space-y-4">
                {industryOptions.map(industry => (
                  <div key={industry.id}>
                    {(() => {
                      const Icon = industryIcons[industry.id] || FaIndustry;
                      return (
                        <label className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${rowDirection} ${textAlign}`}>
                          <input
                            type="checkbox"
                            checked={formData.mainIndustries.includes(industry.id)}
                            onChange={() => toggleMainIndustry(industry.id)}
                            className={inputMargin}
                          />
                          <span className={`${iconMargin} text-black`}>
                            <Icon size={18} />
                          </span>
                          <span className="font-semibold">{industry.name}</span>
                        </label>
                      );
                    })()}
                    <div
                      id={`sub-${industry.id}`}
                      className={`${expandMargin} mt-2 space-y-2 ${expandedIndustries[industry.id] ? 'block' : 'hidden'}`}
                    >
                      {industry.subs.map(sub => (
                        <label key={sub} className={`flex items-center p-2 text-sm cursor-pointer ${rowDirection} ${textAlign}`}>
                          <input
                            type="checkbox"
                            checked={formData.industries.includes(sub)}
                            onChange={() => toggleSubIndustry(sub)}
                            className={iconMargin}
                          />
                          <span className={`${iconMargin} text-black`}>
                            <SubIndustryIcon size={14} />
                          </span>
                          <span className="font-semibold">{sub}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">{t('aiProfile.questions.experience')}</h3>
              <p className="text-sm text-gray-600 mb-4">{t('aiProfile.multiSelectHint')}</p>
              <div className="space-y-3 mb-6">
                {experienceIndustryOptions.map((industry) => {
                  const Icon = experienceIcons[industry.id] || FaBriefcase;
                  const details = formData.experienceDetails[industry.id];
                  return (
                    <div key={industry.id} className="border rounded-lg p-3">
                      <label className={`flex items-center cursor-pointer hover:bg-gray-50 rounded-md ${rowDirection} ${textAlign}`}>
                        <input
                          type="checkbox"
                          checked={formData.experienceIndustries.includes(industry.id)}
                          onChange={() => selectExperienceIndustry(industry.id)}
                          className={inputMargin}
                        />
                        <span className={`${iconMargin} text-black`}>
                          <Icon size={18} />
                        </span>
                        <span className="font-semibold">{industry.label}</span>
                      </label>
                      {formData.experienceIndustries.includes(industry.id) && (
                        <div className="mt-4 flex flex-col md:flex-row gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">{t('aiProfile.experience.yearsLabel')}</label>
                            <select
                              value={details?.years || ''}
                              onChange={(e) => updateExperienceDetail(industry.id, 'years', e.target.value)}
                              className="w-full p-3 border rounded-lg"
                            >
                              <option value="">{t('aiProfile.experience.selectYears')}</option>
                              {Array.from({ length: 20 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {t('aiProfile.experience.yearsOption', { count: i + 1 })}
                                </option>
                              ))}
                              <option value="20+">{t('aiProfile.experience.yearsPlus')}</option>
                            </select>
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">{t('aiProfile.experience.orgNameLabel')}</label>
                            <input
                              type="text"
                              value={details?.organisationName || ''}
                              onChange={(e) => updateExperienceDetail(industry.id, 'organisationName', e.target.value)}
                              placeholder={t('aiProfile.experience.orgNamePlaceholder')}
                              className="w-full p-3 border rounded-lg"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">{t('aiProfile.questions.bio')}</h3>
              <textarea
                value={formData.bio}
                onChange={(e) => {
                  const words = e.target.value.split(/\s+/).filter(word => word.length > 0);
                  if (words.length <= 100) {
                    setFormData(prev => ({ ...prev, bio: e.target.value }));
                  }
                }}
                placeholder={t('aiProfile.bioPlaceholder')}
                className="w-full p-4 border rounded-lg h-32 resize-none"
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {t('aiProfile.wordsCount', {
                  count: formData.bio.split(/\s+/).filter(word => word.length > 0).length,
                  max: 100
                })}
              </div>
            </div>
          )}

                </div>
              )}
            </div>
          </section>
        </div>

        {!isSubmitted && (
        <div className="ai-modal-footer">
          <div className="ai-footer-hint">{t('aiProfile.footerHint')}</div>
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <button
                onClick={previousQuestion}
                className="ai-btn-secondary"
              >
                {t('aiProfile.buttons.previous')}
              </button>
            )}
            {currentStep < 5 ? (
              <button
                onClick={nextQuestion}
                disabled={!canProceed()}
                className="ai-btn-primary"
              >
                {t('aiProfile.buttons.next')}
              </button>
            ) : (
              <button
                onClick={submitInterview}
                disabled={!canProceed() || isSubmitting}
                className="ai-btn-primary"
              >
                {isSubmitting ? t('aiProfile.buttons.submitting') : t('aiProfile.buttons.submit')}
              </button>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default AIProfileModal;






