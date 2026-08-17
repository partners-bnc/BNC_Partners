import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Mic, ChevronLeft, CheckCircle2, ArrowRight, X } from 'lucide-react';
import Header from '../../Component/Header';
import Footer from '../../Component/Footer';
import { services } from '../../data/services';

const categoryMapping = {
  Financial: [
    'financial-advisory',
    'personal-business-loan',
    'risk-advisory',
    'ksa-specific-services',
    'ifrs',
    'transfer-pricing',
    'esop-advisory',
    'valuation',
    'due-diligence',
    'physical-verification-stock-fixed-asset'
  ],
  Technology: [
    'cybersecurity-data-privacy',
    'erp-implementation-digital-transformation',
    'gcc-operation-hub',
    'transformation-through-ai'
  ],
  ESG: [
    'esg-advisory',
    'training-workshop',
    'recruitment-manpower-services'
  ]
};

const serviceImages = {
  'financial-advisory': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
  'personal-business-loan': 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=600&q=80',
  'cybersecurity-data-privacy': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
  'risk-advisory': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
  'esg-advisory': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
  'erp-implementation-digital-transformation': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
  'gcc-operation-hub': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
  'training-workshop': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80',
  'recruitment-manpower-services': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
  'ksa-specific-services': 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&q=80',
  'ifrs': 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
  'transfer-pricing': 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80',
  'esop-advisory': 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
  'transformation-through-ai': 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80',
  'valuation': 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&w=600&q=80',
  'due-diligence': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
  'physical-verification-stock-fixed-asset': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'
};

const DiscoverServices = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isRtl = i18n.language === 'ar';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  const recognitionRef = useRef(null);

  // Read URL params initially
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && ['Financial', 'Technology', 'ESG'].includes(cat)) {
      setActiveCategory(cat);
    } else {
      setActiveCategory('All');
    }
  }, [searchParams]);

  // Set category in URL
  const handleCategorySelect = (categoryName) => {
    setActiveCategory(categoryName);
    if (categoryName === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', categoryName);
    }
    setSearchParams(searchParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToMain = () => {
    setSearchQuery('');
    handleCategorySelect('All');
  };

  // Toast helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
    }, 3000);
  };

  // Voice Search setup
  const startVoiceAssistant = () => {
    setIsVoiceModalOpen(true);
    setVoiceStatus(t('discoverServices.voice.listening', { defaultValue: 'Listening... Speak your requirement' }));
    setIsListening(true);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = isRtl ? 'ar-SA' : 'en-US';
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        handleVoiceCommand(speechResult);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setVoiceStatus(t('discoverServices.voice.error', { defaultValue: 'Speech recognition error. Please try again.' }));
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (e) {
        console.error(e);
      }
    } else {
      setIsListening(false);
      setVoiceStatus(t('discoverServices.voice.notSupported', { defaultValue: 'Voice recognition not supported in this browser.' }));
    }
  };

  const closeVoiceAssistant = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setIsVoiceModalOpen(false);
    setIsListening(false);
  };

  const handleVoiceCommand = (commandText) => {
    setVoiceStatus(t('discoverServices.voice.recognized', { defaultValue: 'Recognized: "{{command}}"' }).replace('{{command}}', commandText));
    setIsListening(false);
    setTimeout(() => {
      setIsVoiceModalOpen(false);
      setSearchQuery(commandText);
      
      const lowerText = commandText.toLowerCase();
      if (lowerText.includes('esg') || lowerText.includes('sustainability') || lowerText.includes('بيئة')) {
        handleCategorySelect('ESG');
      } else if (lowerText.includes('cfo') || lowerText.includes('finance') || lowerText.includes('loan') || lowerText.includes('مال')) {
        handleCategorySelect('Financial');
      } else if (lowerText.includes('cyber') || lowerText.includes('tech') || lowerText.includes('security') || lowerText.includes('تقني')) {
        handleCategorySelect('Technology');
      }
      showToast(t('discoverServices.voice.applied', { defaultValue: 'Voice query applied: "{{command}}"' }).replace('{{command}}', commandText));
    }, 1200);
  };

  // Resolve service lists
  const localizedServices = useMemo(() => {
    return services.map(service => {
      const localizedTitle = t(`servicesData.${service.id}.title`, { defaultValue: service.title });
      const localizedSummary = t(`servicesData.${service.id}.summary`, { defaultValue: service.summary });
      const localizedBullets = t(`servicesData.${service.id}.bullets`, { returnObjects: true, defaultValue: service.bullets });
      return {
        ...service,
        title: localizedTitle,
        summary: localizedSummary,
        bullets: Array.isArray(localizedBullets) ? localizedBullets : service.bullets,
        image: serviceImages[service.id] || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80'
      };
    });
  }, [t, i18n.language]);

  // Categories helper
  const categoryServices = useMemo(() => {
    if (activeCategory === 'All') return localizedServices;
    const allowedIds = categoryMapping[activeCategory] || [];
    return localizedServices.filter(s => allowedIds.includes(s.id));
  }, [activeCategory, localizedServices]);

  // Filtered services by search query
  const filteredServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return categoryServices;
    return localizedServices.filter(s => {
      const titleMatch = s.title.toLowerCase().includes(query);
      const summaryMatch = s.summary.toLowerCase().includes(query);
      const bulletsMatch = s.bullets.some(b => b.toLowerCase().includes(query));
      const descMatch = (s.description || []).some(d => d.toLowerCase().includes(query));
      return titleMatch || summaryMatch || bulletsMatch || descMatch;
    });
  }, [searchQuery, categoryServices, localizedServices]);

  // Trending services (Finance, Growth, Security)
  const trendingServices = useMemo(() => {
    const trendingIds = ['financial-advisory', 'personal-business-loan', 'cybersecurity-data-privacy'];
    return localizedServices.filter(s => trendingIds.includes(s.id));
  }, [localizedServices]);

  const categories = [
    {
      key: 'Financial',
      title: t('discoverServices.categories.financial', { defaultValue: 'FINANCIAL' }),
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80'
    },
    {
      key: 'Technology',
      title: t('discoverServices.categories.technology', { defaultValue: 'TECHNOLOGY' }),
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
    },
    {
      key: 'ESG',
      title: t('discoverServices.categories.esg', { defaultValue: 'ESG' }),
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const isShowingResults = activeCategory !== 'All' || searchQuery.trim().length > 0;

  return (
    <>
      <Header />
      
      {/* Top Brand Accent Line - Elegant fading gradient */}
      <div className="h-[1.5px] bg-gradient-to-r from-transparent via-[#E52E38]/30 to-transparent w-full"></div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full font-geist" dir={isRtl ? 'rtl' : 'ltr'}>
        
        {/* Hero title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 bg-red-50 text-[#E52E38] text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider mb-3">
            {t('discoverServices.badge', { defaultValue: 'Services Directory' })}
          </span>
          <h1 className="text-4xl sm:text-5xl font-semibold text-slate-900 tracking-tight mb-4">
            {t('discoverServices.title', { defaultValue: 'Discover Services' })}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            {t('discoverServices.description', { defaultValue: 'Connect with top-tier professionals for tailored financial planning, tax strategy, and investment consulting.' })}
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-16 px-2">
          <div className="relative flex items-center bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 focus-within:ring-2 focus-within:ring-[#DC2626]/20 focus-within:border-[#DC2626] transition-all">
            <Search className={`w-5 h-5 text-slate-400 ${isRtl ? 'mr-3' : 'ml-3'} shrink-0`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('discoverServices.searchPlaceholder', { defaultValue: 'Browse Services (e.g., Wealth Management, Tax Audit...)' })}
              className={`w-full bg-transparent py-2.5 px-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none ${isRtl ? 'text-right' : 'text-left'}`}
            />
            
            {/* AI Voice Pill Button */}
            <button
              onClick={startVoiceAssistant}
              className={`px-5 py-2 rounded-xl border border-[#E52E38]/80 text-[#E52E38] hover:bg-[#E52E38] hover:text-white font-bold text-xs transition-all flex items-center gap-2 shrink-0 shadow-sm group ${isRtl ? 'ml-1' : 'mr-1'}`}
            >
              <Mic className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span>{t('discoverServices.aiVoice', { defaultValue: 'AI Voice' })}</span>
            </button>
          </div>
        </div>

        {/* MAIN VIEW: Explore Categories + Trending */}
        {!isShowingResults ? (
          <div className="space-y-16 animate-in fade-in duration-300">
            
            {/* Explore Categories Section */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-6 bg-[#E52E38] rounded-full"></div>
                <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                  {t('discoverServices.exploreCategories', { defaultValue: 'Explore Categories' })}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {categories.map((cat) => (
                  <div
                    key={cat.key}
                    onClick={() => handleCategorySelect(cat.key)}
                    className="group relative h-64 sm:h-72 rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent group-hover:via-slate-950/50 transition-colors duration-300"></div>
                    <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                      <h3 className="text-2xl sm:text-3xl font-semibold tracking-wider text-white uppercase drop-shadow-md group-hover:scale-105 transition-transform duration-300">
                        {cat.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Trending Services Section */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-6 bg-[#E52E38] rounded-full"></div>
                <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                  {t('discoverServices.trendingServices', { defaultValue: 'Trending Services' })}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {trendingServices.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
                  >
                    <div>
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <span className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} bg-slate-900/80 text-white text-[10px] font-bold px-3 py-1 rounded-md shadow-sm uppercase tracking-wider`}>
                          {service.id === 'cybersecurity-data-privacy' ? t('discoverServices.tags.tech', { defaultValue: 'Technology' }) : t('discoverServices.tags.finance', { defaultValue: 'Finance' })}
                        </span>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">{service.title}</h3>
                        <ul className="space-y-3 text-xs text-slate-600 font-medium">
                          {service.bullets.slice(0, 4).map((bullet, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="p-6 pt-0">
                      <button
                        onClick={() => navigate(`/services/${service.id}`)}
                        className="w-full py-3 rounded-xl bg-slate-900 hover:bg-[#E52E38] text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 group"
                      >
                        <span>{t('discoverServices.viewCategory', { defaultValue: 'View Service' })}</span>
                        <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        ) : (
          /* CATEGORIES DRILLDOWN OR SEARCH RESULTS VIEW */
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Back Button Navigation */}
            <button
              onClick={handleBackToMain}
              className={`inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#E52E38] transition-colors mb-2 group`}
            >
              <ChevronLeft className={`w-4 h-4 transition-transform group-hover:-translate-x-0.5`} />
              <span>{t('discoverServices.back', { defaultValue: 'Back' })}</span>
            </button>

            {/* Breadcrumb Title Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-6 bg-[#E52E38] rounded-full"></div>
              <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                {searchQuery.trim().length > 0
                  ? t('discoverServices.searchResults', { defaultValue: 'Search Results for: "{{query}}"' }).replace('{{query}}', searchQuery)
                  : `${t('discoverServices.categoriesTitle', { defaultValue: 'Categories' })} > ${t(`discoverServices.categories.${activeCategory.toLowerCase()}`, { defaultValue: activeCategory })}`}
              </h2>
            </div>

            {/* Services Grid */}
            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
                  >
                    <div>
                      <div className="relative h-48 overflow-hidden bg-slate-100">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <span className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} bg-slate-900/80 text-white text-[10px] font-bold px-3 py-1 rounded-md shadow-sm uppercase tracking-wider`}>
                          {activeCategory !== 'All' ? t(`discoverServices.categories.${activeCategory.toLowerCase()}`, { defaultValue: activeCategory }) : 'BNC'}
                        </span>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">{service.title}</h3>
                        <p className="text-xs text-slate-400 font-medium mb-4 leading-relaxed">{service.summary}</p>
                        <ul className="space-y-3 text-xs text-slate-600 font-medium">
                          {service.bullets.slice(0, 4).map((bullet, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="p-6 pt-0">
                      <button
                        onClick={() => navigate(`/services/${service.id}`)}
                        className="w-full py-3 rounded-xl bg-slate-900 hover:bg-[#E52E38] text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 group"
                      >
                        <span>{t('discoverServices.viewCategory', { defaultValue: 'View Service' })}</span>
                        <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-xl mx-auto">
                <p className="text-slate-400 font-medium text-sm mb-4">
                  {t('discoverServices.noResults', { defaultValue: 'No services found matching your query.' })}
                </p>
                <button
                  onClick={handleBackToMain}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-[#E52E38] text-white font-bold text-xs transition-all"
                >
                  {t('discoverServices.resetSearch', { defaultValue: 'Clear Filter' })}
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* AI VOICE ASSISTANT MODAL */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300 ${isVoiceModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`w-full max-w-sm bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl relative text-center transform transition-transform duration-300 ${isVoiceModalOpen ? 'scale-100' : 'scale-95'}`}>
          
          <button
            onClick={closeVoiceAssistant}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Pulsing Mic Icon */}
          <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            {isListening && (
              <div className="absolute inset-0 rounded-full bg-[#E52E38]/20 animate-ping"></div>
            )}
            <div className="w-16 h-16 rounded-full bg-[#E52E38] text-white flex items-center justify-center shadow-lg shadow-[#E52E38]/30 relative z-10">
              <Mic className="w-8 h-8" />
            </div>
          </div>

          {/* Voice Status Text */}
          <h3 className="text-xl font-extrabold text-slate-900 mb-1">
            {t('discoverServices.voice.modalTitle', { defaultValue: 'BNC AI Voice Assistant' })}
          </h3>
          <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">
            {voiceStatus}
          </p>

          {/* Animated Soundwave Visualizer */}
          {isListening && (
            <div className="flex items-center justify-center gap-1.5 h-12 mb-6">
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes voiceWave {
                  0%, 100% { height: 8px; }
                  50% { height: 32px; }
                }
                .wave-bar-react {
                  width: 4px;
                  background-color: #E52E38;
                  border-radius: 9999px;
                  animation: voiceWave 1.2s ease-in-out infinite;
                }
                .w-bar-1 { animation-delay: 0.0s; }
                .w-bar-2 { animation-delay: 0.2s; }
                .w-bar-3 { animation-delay: 0.4s; }
                .w-bar-4 { animation-delay: 0.1s; }
                .w-bar-5 { animation-delay: 0.3s; }
              `}} />
              <div className="wave-bar-react w-bar-1"></div>
              <div className="wave-bar-react w-bar-2"></div>
              <div className="wave-bar-react w-bar-3"></div>
              <div className="wave-bar-react w-bar-4"></div>
              <div className="wave-bar-react w-bar-5"></div>
            </div>
          )}

          {/* Simulation Controls */}
          <div className="space-y-2 mt-4">
            <button
              onClick={() => handleVoiceCommand(isRtl ? 'عرض خدمات الحوكمة البيئية' : 'Show ESG Services')}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {isRtl ? 'تجربة: "عرض خدمات الحوكمة البيئية"' : 'Try: "Show ESG Services"'}
            </button>
            <button
              onClick={() => handleVoiceCommand(isRtl ? 'البحث عن خدمات المدير المالي الافتراضي' : 'Find Virtual CFO')}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {isRtl ? 'تجربة: "البحث عن خدمات المدير المالي"' : 'Try: "Find Virtual CFO"'}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <div className={`fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 transform transition-all duration-300 ${isToastVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        <span className="text-xs font-bold">{toastMessage}</span>
      </div>

      <Footer />
    </>
  );
};

export default DiscoverServices;
