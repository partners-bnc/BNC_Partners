import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';
import ar from './locales/ar/translation.json';

const savedLanguage = typeof localStorage !== 'undefined'
  ? localStorage.getItem('language')
  : null;

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar }
    },
    lng: savedLanguage || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    returnObjects: true
  });

const updateDocumentLang = (lng) => {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
};

updateDocumentLang(i18n.language || 'en');

i18n.on('languageChanged', (lng) => {
  updateDocumentLang(lng);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('language', lng);
  }
});

export default i18n;
