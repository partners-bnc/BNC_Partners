import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiEye,
  FiFileText,
  FiHelpCircle,
  FiInfo,
  FiList,
  FiMail,
  FiPhone,
  FiBookOpen,
  FiUsers
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import Header from '../../Component/Header';
import Footer from '../../Component/Footer';
import { getServiceById } from '../../data/services';

const ServiceDetail = () => {
  const navigate = useNavigate();
  const { country, serviceId } = useParams();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const textAlign = isRtl ? 'text-right' : 'text-left';
  const rowDirection = isRtl ? 'flex-row-reverse' : 'flex-row';
  const mdRowDirection = isRtl ? 'md:flex-row-reverse' : 'md:flex-row';
  const inputAlign = isRtl ? 'text-right' : 'text-left';
  const iconMargin = isRtl ? 'mr-4' : 'ml-4';
  const sectionPadding = isRtl ? 'pr-8' : 'pl-8';
  const listPadding = isRtl ? 'pr-5' : 'pl-5';
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState('know-more');
  const [hoveredHighlight, setHoveredHighlight] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });

  const service = useMemo(() => {
    const found = getServiceById(serviceId);
    if (!found || !found.country.includes(country)) {
      return null;
    }

    const localizedTitle = t(`servicesData.${found.id}.title`, {
      defaultValue: found.title
    });
    const localizedSummary = t(`servicesData.${found.id}.summary`, {
      defaultValue: found.summary
    });
    const localizedBullets = t(`servicesData.${found.id}.bullets`, {
      returnObjects: true,
      defaultValue: found.bullets
    });
    const localizedDescription = t(`servicesData.${found.id}.description`, {
      returnObjects: true,
      defaultValue: found.description
    });
    const localizedManpower = t(`servicesData.${found.id}.manpowerDescription`, {
      defaultValue: found.manpowerDescription
    });
    const localizedDocuments = t(`servicesData.${found.id}.documents`, {
      returnObjects: true,
      defaultValue: found.documents || []
    });

    return {
      ...found,
      title: localizedTitle,
      summary: localizedSummary,
      bullets: Array.isArray(localizedBullets) ? localizedBullets : found.bullets,
      description: Array.isArray(localizedDescription) ? localizedDescription : found.description,
      manpowerDescription: localizedManpower,
      documents: Array.isArray(localizedDocuments) ? localizedDocuments : found.documents
    };
  }, [country, serviceId, t, i18n.language]);

  const countryLabelMap = {
    india: t('countries.india'),
    'saudi-arabia': t('countries.saudi'),
    other: t('countries.other'),
    global: t('countries.other')
  };
  const countryLabel = countryLabelMap[country] || (country ? country.replace('-', ' ') : '');
  const commonDocuments = [
    {
      label: t('serviceDetail.documentsLabels.bncGlobal'),
      url: 'https://drive.google.com/file/d/1U44K-42bhLuTntT2xOdWAIqBW1KzMMpp/view?usp=sharing'
    }
  ];
  const saudiOnlyDocuments = [
    {
      label: t('serviceDetail.documentsLabels.bncGlobalKsa'),
      url: 'https://drive.google.com/file/d/1XV4OlKqt_7YhIR4B4koFVXYISw7Oa8Er/view?usp=sharing'
    }
  ];

  const sections = [
    {
      key: 'know-more',
      label: t('serviceDetail.sections.knowMore.label'),
      heading: t('serviceDetail.sections.knowMore.heading'),
      description: t('serviceDetail.sections.knowMore.description')
    },
    {
      key: 'manpower',
      label: t('serviceDetail.sections.manpower.label'),
      heading: t('serviceDetail.sections.manpower.heading'),
      description: t('serviceDetail.sections.manpower.description')
    },
    {
      key: 'enquiry',
      label: t('serviceDetail.sections.enquiry.label', { service: service?.title || '' }),
      heading: t('serviceDetail.sections.enquiry.heading', { service: service?.title || '' }),
      description: t('serviceDetail.sections.enquiry.description', { service: service?.title || '' })
    },
    {
      key: 'training',
      label: t('serviceDetail.sections.training.label'),
      heading: t('serviceDetail.sections.training.heading'),
      description: t('serviceDetail.sections.training.description')
    },
    {
      key: 'contact',
      label: t('serviceDetail.sections.contact.label'),
      heading: t('serviceDetail.sections.contact.heading'),
      description: t('serviceDetail.sections.contact.description')
    }
  ];

  const activeSectionData = sections.find((section) => section.key === activeSection) || sections[0];
  const sectionIconMap = {
    'know-more': FiInfo,
    manpower: FiUsers,
    enquiry: FiHelpCircle,
    training: FiBookOpen
  };
  const ActiveSectionIcon = sectionIconMap[activeSection] || FiInfo;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const stored = localStorage.getItem('partnerUser');
    if (!stored) return;
    try {
      const user = JSON.parse(stored);
      const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
      setFormValues((prev) => ({
        ...prev,
        name: fullName || prev.name,
        email: user?.email || prev.email,
        phone: user?.phone || prev.phone
      }));
    } catch (error) {
      console.error('Failed to read partner user data', error);
    }
  }, []);

  useEffect(() => {
    setSubmitted(false);
  }, [activeSection, serviceId, country]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formValues.name || !formValues.email) {
      alert(t('serviceDetail.loginRequired'));
      return;
    }

    const formTypeLabel = activeSection === 'manpower'
      ? 'Manpower'
      : activeSection === 'training'
        ? 'Training'
        : 'Enquiry';

    const params = new URLSearchParams({
      action: 'submitEnquiry',
      country: country || '',
      countryLabel: countryLabel || '',
      service: service?.title || '',
      formType: formTypeLabel,
      name: formValues.name || '',
      email: formValues.email || '',
      phone: formValues.phone || '',
      company: formValues.company || '',
      message: formValues.message || ''
    });

    const url = `https://script.google.com/macros/s/AKfycbxFTbVglGTWrOFI0VVjM4NwcQ80kUtuvLhwPPwNw-Vi3OMF3Cn7tzC3cz_iyCzSNY8T9g/exec?${params}`;
    setIsSubmitting(true);
    fetch(url, { method: 'GET', mode: 'cors' })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          setSubmitted(true);
        } else {
          alert(result.message || t('serviceDetail.submitFailed'));
        }
      })
      .catch((error) => {
        console.error('Enquiry submission error:', error);
        alert(t('serviceDetail.submitFailed'));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const formTitleMap = {
    manpower: t('serviceDetail.formTitles.manpower'),
    enquiry: t('serviceDetail.formTitles.enquiry', { service: service?.title || '' }),
    training: t('serviceDetail.formTitles.training')
  };
  const formCtaMap = {
    manpower: t('serviceDetail.formCtas.manpower'),
    enquiry: t('serviceDetail.formCtas.enquiry'),
    training: t('serviceDetail.formCtas.training')
  };
  const messagePlaceholderMap = {
    manpower: t('serviceDetail.messagePlaceholders.manpower'),
    enquiry: t('serviceDetail.messagePlaceholders.enquiry', { service: service?.title || t('serviceDetail.messagePlaceholders.defaultService') }),
    training: t('serviceDetail.messagePlaceholders.training')
  };
  const formTitle = formTitleMap[activeSection] || t('serviceDetail.requestMoreInfo');
  const formCta = formCtaMap[activeSection] || t('serviceDetail.submitRequest');
  const messagePlaceholder = messagePlaceholderMap[activeSection] || t('serviceDetail.messagePlaceholders.default');

  const LazyVideo = ({ src, title }) => {
    const containerRef = useRef(null);
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
      if (!containerRef.current) return undefined;
      if (shouldLoad) return undefined;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setShouldLoad(true);
            }
          });
        },
        { rootMargin: '150px' }
      );

      observer.observe(containerRef.current);

      return () => {
        observer.disconnect();
      };
    }, [shouldLoad]);

    return (
      <div ref={containerRef} className="relative w-full h-full">
        {shouldLoad ? (
          <iframe
            className="w-full h-full"
            src={src}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            loading="lazy"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 via-white to-slate-100">
            <div className="h-full w-full animate-pulse bg-[linear-gradient(110deg,rgba(226,232,240,0.35),rgba(255,255,255,0.8),rgba(226,232,240,0.35))] bg-[length:200%_100%]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-geist text-slate-500 shadow-sm">
                {t('countryServices.preparingPreview')}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!service) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-lg">
            <h2 className="font-poppins text-2xl font-bold text-gray-900 mb-3">
              {t('serviceDetail.notFoundTitle')}
            </h2>
            <p className="font-geist text-gray-600 mb-6">
              {t('serviceDetail.notFoundText')}
            </p>
            <button
              onClick={() => navigate('/bnc-services')}
              className="bg-[#2C5AA0] text-white px-5 py-2.5 rounded-xl font-semibold"
            >
              {t('serviceDetail.backToBncServices')}
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-[#f5f7fb] via-[#f9fbff] to-[#eef2f7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className={`flex flex-col gap-6 ${isRtl ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
            <aside className="lg:w-[32%] border border-slate-200 rounded-2xl bg-white shadow-sm lg:sticky lg:top-40 lg:self-start">
              <div className={`p-6 border-b border-slate-200 ${textAlign}`}>
                  <p className="font-geist text-xs uppercase tracking-[0.2em] text-slate-400">
                    {countryLabel}
                  </p>
                  <h1 className="font-poppins text-2xl font-semibold text-gray-900 mt-2">
                    {service.title}
                  </h1>
                  <p className="font-geist text-sm text-gray-600 mt-3">
                    {service.summary}
                  </p>
              </div>
              <div className="px-4 py-4 space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.key}
                    type="button"
                    onClick={() => setActiveSection(section.key)}
                    className={`group relative w-full ${isRtl ? 'text-right' : 'text-left'} px-4 py-3 rounded-xl border transition ${
                      activeSection === section.key
                        ? 'bg-[#2C5AA0]/10 border-[#2C5AA0]/30 text-[#1e3a8a]'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="relative inline-block text-sm font-semibold font-geist">
                      {section.label}
                      <span className={`absolute -bottom-1 ${isRtl ? 'right-0' : 'left-0'} h-0.5 w-0 bg-[#2C5AA0] transition-all duration-500 group-hover:w-full`}></span>
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            <section className={`lg:w-[68%] ${textAlign}`}>
              <div className="space-y-8">
                <div className={`flex flex-col gap-4 ${mdRowDirection} md:items-center md:justify-between ${textAlign}`}>
                  <div>
                    <div>
                      <h2 className="font-poppins text-2xl font-semibold text-gray-900">
                        {activeSectionData.heading}
                      </h2>
                    </div>
                    <p className={`font-geist text-gray-600 mt-2 ${sectionPadding}`}>
                      {activeSectionData.description}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/services/${country}`)}
                    className="bg-[#2C5AA0] text-white px-5 py-2.5 rounded-xl font-semibold shadow hover:bg-[#1e3a8a] transition"
                  >
                    {t('serviceDetail.backToServices')}
                  </button>
                </div>

                {activeSection === 'know-more' ? (
                  <>
                    <div className="border border-slate-200 rounded-2xl p-4 bg-white">
                      {service.videoUrl ? (
                        <div className="aspect-video rounded-2xl overflow-hidden shadow-md">
                          <LazyVideo
                            src={service.videoUrl}
                            title={`${service.title} overview`}
                          />
                        </div>
                      ) : (
                        <div className="aspect-video rounded-2xl border border-dashed border-slate-300 flex items-center justify-center text-slate-500 font-geist">
                          {t('serviceDetail.videoComingSoon')}
                        </div>
                      )}
                      <div className="mt-5 border-t border-slate-200 pt-5">
                        <div className={`inline-flex items-start gap-2 text-gray-900 ${rowDirection}`}>
                          <span className="inline-flex h-6 w-6 items-center justify-center text-[#2C5AA0]">
                            <FiEye className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                          <div>
                            <h3 className="font-poppins text-xl font-semibold">
                              {t('serviceDetail.overview')}
                            </h3>
                            <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-[#2C5AA0] to-[#1e3a8a]"></div>
                          </div>
                        </div>
                        {service.description && service.description.length > 0 ? (
                          <p className={`text-gray-600 font-geist mt-3 ${sectionPadding}`}>
                            {service.description.join(' ')}
                          </p>
                        ) : (
                          <p className={`font-geist text-gray-600 mt-3 ${sectionPadding}`}>
                            {t('serviceDetail.overviewComingSoon')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-2xl p-6 bg-white">
                      <div className="grid gap-6 md:grid-cols-2 items-start">
                        <div>
                          <div className={`inline-flex items-start gap-2 text-gray-900 ${rowDirection}`}>
                            <span className="inline-flex h-6 w-6 items-center justify-center text-[#2C5AA0]">
                              <FiList className="h-3.5 w-3.5" aria-hidden="true" />
                            </span>
                            <div>
                              <h3 className="font-poppins text-xl font-semibold">
                                {t('serviceDetail.serviceDetails')}
                              </h3>
                              <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-[#2C5AA0] to-[#1e3a8a]"></div>
                            </div>
                          </div>
                        </div>
                        <div className={isRtl ? 'md:pr-6' : 'md:pl-6'}>
                          <div className={`inline-flex items-start gap-2 text-gray-900 ${rowDirection}`}>
                            <span className="inline-flex h-6 w-6 items-center justify-center text-[#2C5AA0]">
                              <FiFileText className="h-3.5 w-3.5" aria-hidden="true" />
                            </span>
                            <div>
                              <h4 className="font-poppins text-lg font-semibold">
                                {t('serviceDetail.documents')}
                              </h4>
                              <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-[#2C5AA0] to-[#1e3a8a]"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-6 md:grid-cols-2">
                        <div className={sectionPadding}>
                          {service.bullets.length > 0 ? (
                            <ul className="space-y-2 text-gray-700 list-disc list-inside font-geist">
                              {service.bullets.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="font-geist text-gray-600">
                              {t('serviceDetail.servicesComingSoon')}
                            </p>
                          )}
                        </div>
                        <div className={`border-t border-slate-200 pt-4 md:border-t-0 md:border-slate-300 ${isRtl ? 'md:border-r md:pr-6' : 'md:border-l md:pl-6'}`}>
                          {(() => {
                            const serviceDocs = service.documents || [];
                            const countryDocs = country === 'saudi-arabia' ? saudiOnlyDocuments : [];
                            const docs = [...commonDocuments, ...serviceDocs, ...countryDocs];
                            if (docs.length === 0) {
                              return (
                                <p className={`font-geist text-gray-600 ${sectionPadding}`}>
                                  {t('serviceDetail.documentsComingSoon')}
                                </p>
                              );
                            }
                            return (
                              <ul className={`space-y-3 font-geist text-gray-700 ${sectionPadding}`}>
                                {docs.map((doc) => (
                                  <li key={`${doc.label}-${doc.url}`}>
                                    <a
                                      href={doc.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-2 text-[#2C5AA0] hover:text-[#1e3a8a] font-semibold"
                                    >
                                      <FiFileText className="h-4 w-4" aria-hidden="true" />
                                      {doc.label}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </>
                ) : activeSection === 'manpower' ? (
                  <div className="border border-slate-200 rounded-2xl p-6 bg-white">
                    <div className={`inline-flex items-start gap-2 text-gray-900 ${rowDirection}`}>
                      <span className="inline-flex h-6 w-6 items-center justify-center text-[#2C5AA0]">
                        <FiUsers className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-poppins text-xl font-semibold">
                          {t('serviceDetail.manpowerSupport')}
                        </h3>
                        <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-[#2C5AA0] to-[#1e3a8a]"></div>
                      </div>
                    </div>
                    {service.manpowerDescription ? (
                      <p className={`font-geist text-gray-600 mt-3 ${sectionPadding}`}>
                        {service.manpowerDescription}
                      </p>
                    ) : (
                      <p className={`font-geist text-gray-600 mt-3 ${sectionPadding}`}>
                        {t('serviceDetail.manpowerFallback', { service: service.title })}
                      </p>
                    )}
                  </div>
                ) : activeSection === 'training' ? (
                  <div className={`border border-slate-200 rounded-2xl p-6 bg-white ${textAlign}`}>
                    <div className={`grid gap-6 ${isRtl ? 'md:grid-cols-[0.9fr_1.1fr]' : 'md:grid-cols-[1.1fr_0.9fr]'}`}>
                      <div>
                        <div className={`inline-flex items-start gap-2 text-gray-900 ${rowDirection}`}>
                          <span className="inline-flex h-6 w-6 items-center justify-center text-[#2C5AA0]">
                            <FiBookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                            <div>
                              <h3 className="font-poppins text-xl font-semibold">
                              {t('serviceDetail.training.title')}
                              </h3>
                              <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-[#2C5AA0] to-[#1e3a8a]"></div>
                            </div>
                          </div>
                        <p className={`font-geist text-gray-600 mt-3 ${sectionPadding}`}>
                          {t('serviceDetail.training.description', { service: service.title })}
                        </p>
                        <div className={`mt-5 ${sectionPadding}`}>
                          <p className="font-geist text-sm text-slate-500 uppercase tracking-[0.2em]">
                            {t('serviceDetail.training.coverageTitle')}
                          </p>
                          <ul className={`mt-3 space-y-2 text-gray-700 list-disc list-outside ${listPadding} font-geist`}>
                            {t('serviceDetail.training.coverageItems', { returnObjects: true }).map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <p className="font-geist text-sm text-slate-500 uppercase tracking-[0.2em]">
                          {t('serviceDetail.training.highlightsTitle')}
                        </p>
                        <div className="mt-4 space-y-4" style={{ perspective: '1000px' }}>
                          {t('serviceDetail.training.highlights', { returnObjects: true }).map((item, index) => (
                            <div
                              key={item.title}
                              className="rounded-xl border border-slate-200 bg-white p-4"
                              onMouseEnter={() => setHoveredHighlight(index)}
                              onMouseLeave={() => setHoveredHighlight(null)}
                              style={{
                                transform:
                                  hoveredHighlight === index
                                    ? `translateY(-8px) rotateX(6deg) rotateY(${index % 2 === 0 ? '-4deg' : '4deg'})`
                                    : 'translateZ(0)',
                                boxShadow:
                                  hoveredHighlight === index
                                    ? '0 18px 40px rgba(15, 23, 42, 0.18)'
                                    : '0 4px 12px rgba(15, 23, 42, 0.08)',
                                transition: 'transform 240ms ease, box-shadow 240ms ease'
                              }}
                            >
                              <p className="font-poppins text-sm font-semibold text-gray-900">
                                {item.title}
                              </p>
                              <p className="font-geist text-sm text-gray-600 mt-2">
                                {item.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activeSection === 'contact' ? (
                  <div className={`border border-slate-200 rounded-2xl p-6 bg-white ${textAlign}`}>
                    <div className={`flex items-center justify-between flex-wrap gap-4 ${rowDirection}`}>
                      <div className={textAlign}>
                        <h3 className="font-poppins text-xl font-semibold text-gray-900">
                          {t('serviceDetail.contact.title')}
                        </h3>
                        <p className="font-geist text-gray-600 text-sm mt-2">
                          {t('serviceDetail.contact.description')}
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <a
                          href="mailto:info@bncglobal.in"
                          className="group border border-slate-200 rounded-2xl bg-white p-5 transition hover:border-slate-300 hover:shadow-md"
                        >
                          <div className={`flex items-center justify-between ${rowDirection}`}>
                            <div className={textAlign}>
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-geist">
                                {t('serviceDetail.contact.email')}
                              </p>
                              <p className="font-geist text-sm text-slate-700 mt-2">
                                info@bncglobal.in
                              </p>
                            </div>
                            <div className={`${iconMargin} h-10 w-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center group-hover:border-[#2C5AA0]/40 group-hover:bg-[#2C5AA0]/10 transition`}>
                              <FiMail className="h-5 w-5 text-[#2C5AA0]" aria-hidden="true" />
                            </div>
                          </div>
                        </a>
                        <a
                          href="https://wa.me/919958711796"
                          target="_blank"
                          rel="noreferrer"
                          className="group border border-emerald-200 rounded-2xl bg-white p-5 transition hover:border-emerald-300 hover:shadow-md"
                        >
                          <div className={`flex items-center justify-between ${rowDirection}`}>
                            <div className={textAlign}>
                              <p className="text-xs uppercase tracking-[0.2em] text-emerald-500 font-geist">
                                {t('serviceDetail.contact.whatsapp')}
                              </p>
                              <p className="font-geist text-sm text-emerald-700 mt-2">
                                +91 99587 11796
                              </p>
                            </div>
                            <div className={`${iconMargin} h-10 w-10 rounded-xl border border-emerald-200 bg-emerald-50 flex items-center justify-center group-hover:border-emerald-300 group-hover:bg-emerald-100 transition`}>
                              <FiUsers className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                            </div>
                          </div>
                        </a>
                        <a
                          href="tel:+919810575613"
                          className="group border border-slate-200 rounded-2xl bg-white p-5 transition hover:border-slate-300 hover:shadow-md"
                        >
                          <div className={`flex items-center justify-between ${rowDirection}`}>
                            <div className={textAlign}>
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-geist">
                                {t('serviceDetail.contact.call')}
                              </p>
                              <p className="font-geist text-sm text-slate-700 mt-2">
                                +91 98105 75613
                              </p>
                            </div>
                            <div className={`${iconMargin} h-10 w-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center group-hover:border-[#2C5AA0]/40 group-hover:bg-[#2C5AA0]/10 transition`}>
                              <FiPhone className="h-5 w-5 text-[#2C5AA0]" aria-hidden="true" />
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                ) : activeSection === 'enquiry' ? (
                  <div className="border border-slate-200 rounded-2xl p-6 bg-white">
                    <div className={`inline-flex items-start gap-2 text-gray-900 ${rowDirection}`}>
                      <span className="inline-flex h-6 w-6 items-center justify-center text-[#2C5AA0]">
                        <FiHelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-poppins text-xl font-semibold">
                          {t('serviceDetail.enquiryDetails')}
                        </h3>
                        <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-[#2C5AA0] to-[#1e3a8a]"></div>
                      </div>
                    </div>
                    <p className={`font-geist text-gray-600 mt-3 ${sectionPadding}`}>
                      {t('serviceDetail.enquiryDetailsDesc', { service: service.title })}
                    </p>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-2xl p-6 bg-white">
                    <div className={`inline-flex items-start gap-2 text-gray-900 ${rowDirection}`}>
                      <span className="inline-flex h-6 w-6 items-center justify-center text-[#2C5AA0]">
                        <FiHelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-poppins text-xl font-semibold">
                          {t('serviceDetail.howWeHelp')}
                        </h3>
                        <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-[#2C5AA0] to-[#1e3a8a]"></div>
                      </div>
                    </div>
                    <p className={`font-geist text-gray-600 mt-3 ${sectionPadding}`}>
                      {t('serviceDetail.howWeHelpDesc', { service: service.title })}
                    </p>
                  </div>
                )}

                {activeSection !== 'contact' && activeSection !== 'know-more' && (
                  <div className="border border-slate-200 rounded-2xl p-6 bg-white">
                    <div className={`inline-flex items-start gap-2 text-gray-900 ${rowDirection}`}>
                      <span className="inline-flex h-6 w-6 items-center justify-center text-[#2C5AA0]">
                        <FiMail className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-poppins text-xl font-semibold">
                          {formTitle}
                        </h3>
                        <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-[#2C5AA0] to-[#1e3a8a]"></div>
                      </div>
                    </div>
                    <p className={`font-geist text-gray-600 text-sm mt-3 mb-4 ${sectionPadding}`}>
                      {activeSection === 'enquiry'
                        ? t('serviceDetail.enquiryDesc', { service: service.title })
                        : t('serviceDetail.requestMoreInfoDesc')}
                    </p>
                    {submitted ? (
                      <div className="bg-green-50 border border-green-100 text-green-800 rounded-xl p-4 font-geist text-sm">
                        {t('serviceDetail.thankYou', { service: service.title, country: countryLabel })}
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className={`space-y-3 ${sectionPadding}`}>
                        <input type="hidden" name="country" value={country} />
                        <input type="hidden" name="service" value={service.title} />
                        <input type="hidden" name="topic" value={activeSectionData.label} />
                        <input
                          type="text"
                          name="name"
                          value={formValues.name}
                          onChange={handleChange}
                          placeholder={t('serviceDetail.form.fullName')}
                          className={`w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-geist bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2C5AA0]/20 ${inputAlign}`}
                          required
                          readOnly
                        />
                        <input
                          type="email"
                          name="email"
                          value={formValues.email}
                          onChange={handleChange}
                          placeholder={t('serviceDetail.form.email')}
                          className={`w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-geist bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2C5AA0]/20 ${inputAlign}`}
                          required
                          readOnly
                        />
                        <input
                          type="tel"
                          name="phone"
                          value={formValues.phone}
                          onChange={handleChange}
                          placeholder={t('serviceDetail.form.phone')}
                          className={`w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-geist bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2C5AA0]/20 ${inputAlign}`}
                          readOnly
                        />
                        <input
                          type="text"
                          name="company"
                          value={formValues.company}
                          onChange={handleChange}
                          placeholder={t('serviceDetail.form.company')}
                          className={`w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-geist focus:outline-none focus:ring-2 focus:ring-[#2C5AA0]/20 ${inputAlign}`}
                        />
                        <textarea
                          name="message"
                          value={formValues.message}
                          onChange={handleChange}
                          rows="4"
                          placeholder={messagePlaceholder}
                          className={`w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-geist focus:outline-none focus:ring-2 focus:ring-[#2C5AA0]/20 ${inputAlign}`}
                        />
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-[#2C5AA0] text-white py-2.5 rounded-xl font-semibold shadow hover:bg-[#1e3a8a] transition"
                        >
                          {isSubmitting ? t('serviceDetail.submitting') : formCta}
                        </button>
                      </form>
                    )}
                  </div>
                )}

              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ServiceDetail;
