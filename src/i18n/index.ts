import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zh from './locales/zh.json';
import en from './locales/en.json';
import vi from './locales/vi.json';

i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
    vi: { translation: vi },
  },
  lng: (typeof window !== 'undefined' && localStorage.getItem('lang')) || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
