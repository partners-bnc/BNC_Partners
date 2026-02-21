import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Header from '../../Component/Header';
import Footer from '../../Component/Footer';
import { getServicesByCountry } from '../../data/services';

const CountryServices = ({ country, title, description }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const textAlign = isRtl ? 'text-right' : 'text-left';
  const rowDirection = isRtl ? 'flex-row-reverse' : 'flex-row';
  const mdRowDirection = isRtl ? 'md:flex-row-reverse' : 'md:flex-row';
  const inputAlign = isRtl ? 'text-right' : 'text-left';
  const searchButtonPos = isRtl ? 'left-2' : 'right-2';
  const cardButtonPos = isRtl ? 'left-6' : 'right-6';
  const navigate = useNavigate();
  const services = getServicesByCountry(country);
  const localizedServices = useMemo(() => (
    services.map((service) => {
      const localizedTitle = t(`servicesData.${service.id}.title`, {
        defaultValue: service.title
      });
      const localizedBullets = t(`servicesData.${service.id}.bullets`, {
        returnObjects: true,
        defaultValue: service.bullets
      });
      return {
        ...service,
        title: localizedTitle,
        bullets: Array.isArray(localizedBullets) ? localizedBullets : service.bullets
      };
    })
  ), [services, t, i18n.language]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  const tagOptions = [
    { key: 'high-demand', label: t('countryServices.tags.highDemand') },
    { key: 'high-selling', label: t('countryServices.tags.highSelling') },
    { key: 'specialized', label: t('countryServices.tags.specialized') }
  ];

  const visibleServices = useMemo(() => {
    if (!activeTag) {
      return localizedServices;
    }
    return localizedServices.filter((service) => (service.tags || []).includes(activeTag));
  }, [activeTag, localizedServices]);

  const filteredServices = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) {
      return visibleServices;
    }
    return visibleServices.filter((service) => {
      if (service.title.toLowerCase().includes(term)) {
        return true;
      }
      if (service.id.toLowerCase().includes(term)) {
        return true;
      }
      return service.bullets.some((item) => item.toLowerCase().includes(term));
    });
  }, [searchQuery, visibleServices]);

  const suggestions = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) {
      return [];
    }

    return visibleServices
      .map((service) => {
        const idMatch = service.id.toLowerCase().includes(term);
        const titleMatch = service.title.toLowerCase().includes(term);
        const bulletMatch = service.bullets.find((item) =>
          item.toLowerCase().includes(term)
        );

        if (!idMatch && !titleMatch && !bulletMatch) {
          return null;
        }

        return {
          id: service.id,
          title: service.title,
          hint: bulletMatch || (idMatch ? service.id : ''),
          type: bulletMatch
            ? t('countryServices.suggestions.subService')
            : idMatch
              ? t('countryServices.suggestions.serviceId')
              : t('countryServices.suggestions.service')
        };
      })
      .filter(Boolean)
      .slice(0, 6);
  }, [searchQuery, t, visibleServices]);

  const handleOpenService = (serviceId) => {
    navigate(`/services/${country}/${serviceId}`);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const term = searchQuery.trim().toLowerCase();
    if (!term) {
      setSearchError(t('countryServices.searchErrorEmpty'));
      return;
    }

    const exactId = visibleServices.find((service) => service.id.toLowerCase() === term);
    if (exactId) {
      handleOpenService(exactId.id);
      return;
    }

    const match = visibleServices.find((service) => {
      if (service.title.toLowerCase().includes(term)) {
        return true;
      }
      if (service.id.toLowerCase().includes(term)) {
        return true;
      }
      return service.bullets.some((item) => item.toLowerCase().includes(term));
    });

    if (match) {
      handleOpenService(match.id);
      return;
    }

    setSearchError(t('countryServices.searchErrorNoMatch'));
  };

  const handleSelectSuggestion = (serviceId) => {
    handleOpenService(serviceId);
  };

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

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-[#f5f7fb] via-[#f9fbff] to-[#eef2f7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="relative rounded-3xl shadow-xl mb-10 border border-white/60">
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-[#2C5AA0] via-[#1f4f93] to-[#12346b]" />
              <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -left-16 -bottom-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            </div>
            <div className={`relative z-10 p-8 md:p-10 text-white ${textAlign}`}>
              <div className={`flex flex-col gap-5 ${mdRowDirection} md:items-center md:justify-between`}>
                <div>
                  <p className="font-geist text-blue-100 text-sm uppercase tracking-[0.2em]">
                    {t('countryServices.label')}
                  </p>
                  <h1 className="font-poppins text-3xl md:text-4xl font-bold mt-2">
                    {title}
                  </h1>
                  <p className="font-geist text-blue-100 text-lg mt-3 max-w-2xl">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className={`flex flex-col ${isRtl ? 'lg:flex-row-reverse' : 'lg:flex-row'} lg:items-center lg:justify-between gap-4`}>
              <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xl">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setSearchError('');
                    setIsSuggestionsOpen(true);
                  }}
                  onFocus={() => setIsSuggestionsOpen(true)}
                  placeholder={t('countryServices.searchPlaceholder')}
                  className={`w-full bg-white border border-black rounded-2xl px-4 py-3 text-sm font-geist shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2C5AA0]/20 ${inputAlign}`}
                />
                <button
                  type="submit"
                  className={`absolute ${searchButtonPos} top-1/2 -translate-y-1/2 bg-[#2C5AA0] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow hover:bg-[#1e3a8a] transition`}
                >
                  {t('countryServices.searchButton')}
                </button>
                {isSuggestionsOpen && suggestions.length > 0 && (
                  <div
                    className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden z-20"
                    onMouseLeave={() => setIsSuggestionsOpen(false)}
                  >
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        onClick={() => handleSelectSuggestion(suggestion.id)}
                        className={`w-full px-4 py-3 hover:bg-slate-50 transition-colors ${isRtl ? 'text-right' : 'text-left'}`}
                      >
                        <div className="text-sm font-semibold text-slate-800">
                          {suggestion.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          {suggestion.type}
                          {suggestion.hint ? ` • ${suggestion.hint}` : ''}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </form>

              <div className="flex flex-wrap items-center gap-2">
                {tagOptions.map((tag) => (
                  <button
                    key={tag.key}
                    type="button"
                    onClick={() => setActiveTag((current) => (current === tag.key ? '' : tag.key))}
                    className={`px-4 py-2 rounded-full text-sm font-semibold font-geist border transition transform-gpu perspective-[800px] hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(15,23,42,0.16)] hover:[transform:translateY(-2px)_rotateX(6deg)] ${
                      activeTag === tag.key
                        ? 'bg-[#2C5AA0]/10 text-[#1e3a8a] border-black'
                        : 'bg-white text-slate-700 border-black hover:border-black'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
            {searchError && (
              <p className="text-sm text-red-500 font-geist mt-2">
                {searchError}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="group relative bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="bg-gradient-to-b from-[#f1f5ff] to-[#e8eef9]">
                  <div className="aspect-video">
                    {service.videoUrl ? (
                      <LazyVideo
                        src={service.videoUrl}
                        title={`${service.title} video`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm font-geist">
                        {t('countryServices.videoComingSoon')}
                      </div>
                    )}
                  </div>
                </div>
                <div className={`p-5 pb-16 ${textAlign}`}>
                  <div className={`flex items-center justify-between ${rowDirection}`}>
                    <h2 className="font-poppins text-xl font-semibold text-gray-900">
                      {service.title}
                    </h2>
                    {service.bullets.length > 0 && (
                      <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-geist font-semibold text-[#2C5AA0] bg-blue-50 px-2.5 py-1 rounded-full">
                        {t('countryServices.servicesCount', { count: service.bullets.length })}
                      </span>
                    )}
                  </div>
                  {service.bullets.length > 0 && (
                    <>
                      <div className="h-1 w-16 bg-gradient-to-r from-[#2C5AA0] to-[#1e3a8a] rounded-full mt-3" />
                      <ul className={`mt-4 space-y-2 text-sm text-gray-700 list-disc list-inside ${textAlign}`}>
                        {service.bullets.map((item) => (
                          <li key={item} className="font-geist">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {!service.videoUrl && (
                    <p className="font-geist text-gray-500 text-xs mt-4">
                      {t('countryServices.servicesComingSoon')}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenService(service.id)}
                  className={`absolute bottom-4 ${cardButtonPos} inline-flex items-center gap-2 text-sm font-semibold font-geist text-white rounded-full px-5 py-2.5 bg-gradient-to-r from-[#2C5AA0] to-[#1e3a8a] shadow-lg shadow-[#2C5AA0]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#2C5AA0]/30 hover:-translate-y-0.5 hover:from-[#1e3a8a] hover:to-[#163062] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5AA0]/40`}
                >
                  {t('countryServices.viewMore')}
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-white/20 text-white text-xs transition-transform duration-300 group-hover:translate-x-0.5">
                    <span className="flipInRtl">&#8594;</span>
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CountryServices;
