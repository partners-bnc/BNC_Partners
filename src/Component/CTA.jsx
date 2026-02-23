import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PartnerFormModal from './PartnerFormModal';

const CTA = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="text-white py-16" style={{backgroundColor: '#2C3544'}}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative">
            <span className="block">
              {t('cta.title')} <span style={{color: '#2C5AA0'}}>{t('cta.highlight')}</span>
            </span>
            <div className="w-60 h-0.5 bg-white mx-auto mt-2"></div>
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            {t('cta.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#2C5AA0] text-white px-8 py-3 rounded-full font-semibold transition-colors hover:bg-[#1e3f73] flex items-center justify-center gap-2"
            >
              {t('cta.becomePartner')}
            </button>
            <button 
              onClick={() => window.location.href = 'tel:+919958711796'}
              className="bg-white text-[#2C3544] px-8 py-3 rounded-full font-semibold transition-colors hover:bg-gray-100 flex items-center justify-center gap-2"
            >
              {t('cta.talkToExpert')}
            </button>
          </div>
          
          {/* Social Media Icons */}
          <div className="flex justify-center space-x-4">
            <a
              href="https://www.linkedin.com/company/broccoli-and-carrots-global-services-pvt-ltd-/"
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#2C5AA0] hover:bg-gray-100 transition-colors"
              aria-label="LinkedIn"
              target="_blank"
              rel="noreferrer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a
              href="https://www.instagram.com/bncglobal.in/"
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#2C5AA0] hover:bg-gray-100 transition-colors"
              aria-label="Instagram"
              target="_blank"
              rel="noreferrer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm0 2h10c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3zm10.5 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
              </svg>
            </a>
            <a
              href="https://www.youtube.com/@bncglobal1"
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#2C5AA0] hover:bg-gray-100 transition-colors"
              aria-label="YouTube"
              target="_blank"
              rel="noreferrer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a
              href="https://chat.whatsapp.com/JuKT39dKPEW2RxyA1vuHFK"
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#2C5AA0] hover:bg-gray-100 transition-colors"
              aria-label="WhatsApp Community"
              target="_blank"
              rel="noreferrer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.52 3.48A11.93 11.93 0 0 0 12.05 0C5.46.02.07 5.4.09 12a11.86 11.86 0 0 0 1.62 6L0 24l6.2-1.62A12 12 0 0 0 12 24h.05c6.6-.02 11.99-5.4 11.95-12a11.93 11.93 0 0 0-3.48-8.52zm-8.47 18.5h-.04a10 10 0 0 1-5.1-1.4l-.37-.22-3.68.96.98-3.58-.24-.38A10 10 0 0 1 2.1 12c0-5.46 4.46-9.9 9.95-9.9a9.9 9.9 0 0 1 7 2.9 9.86 9.86 0 0 1 2.9 7c0 5.46-4.45 9.9-9.9 9.9zm5.45-7.4c-.3-.15-1.78-.88-2.05-.98-.27-.1-.47-.15-.67.15-.2.3-.77.98-.95 1.18-.18.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.46-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.03 1-1.03 2.44s1.06 2.83 1.2 3.03c.15.2 2.09 3.19 5.06 4.47.71.31 1.27.5 1.7.64.71.23 1.35.2 1.86.12.57-.09 1.78-.72 2.03-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z"/>
              </svg>
            </a>
          </div>
        </div>
      </section>
      
      <PartnerFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default CTA;
