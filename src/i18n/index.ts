import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pl from './pl';
import nl from './nl';
import en from './en';

// Ustaw domyślny język na holenderski (NL) jeśli użytkownik nie ma zapisanego
const savedLanguage = localStorage.getItem('language');
if (!savedLanguage || savedLanguage === 'pl') {
  localStorage.setItem('language', 'nl');
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      nl,
      en,
      pl,
    },
    lng: localStorage.getItem('language') || 'nl',
    fallbackLng: 'nl',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
