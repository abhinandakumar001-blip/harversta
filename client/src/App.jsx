import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './components/LanguageSelector';

const App = () => {
  const { t, i18n } = useTranslation();

  React.useEffect(() => {
    const loadUserLanguage = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch('http://localhost:5000/api/auth/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.language) {
            i18n.changeLanguage(data.language);
          }
        } catch (err) {
          console.error('Failed to load user language', err);
        }
      }
    };
    loadUserLanguage();
  }, [i18n]);

  return (
    <div className='h-dvh flex flex-col items-center justify-center gap-4 bg-gray-50'>
      <h1 className="text-3xl font-bold text-gray-800">{t('welcome')}</h1>
      <LanguageSelector />
    </div>
  )
}

export default App