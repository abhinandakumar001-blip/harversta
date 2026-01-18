import React from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'ta', name: 'Tamil' }
];

const LanguageSelector = () => {
    const { i18n } = useTranslation();

    const changeLanguage = async (lng) => {
        i18n.changeLanguage(lng);
        // Persist to backend if token exists
        const token = localStorage.getItem('token'); // Assuming token is stored here
        if (token) {
            try {
                await fetch('http://localhost:5000/api/auth/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ language: lng })
                });
            } catch (error) {
                console.error('Failed to update language preference', error);
            }
        }
    };

    return (
        <div className="flex gap-2">
            {languages.map((lng) => (
                <button
                    key={lng.code}
                    onClick={() => changeLanguage(lng.code)}
                    className={`px-3 py-1 rounded border ${i18n.language === lng.code
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                >
                    {lng.name}
                </button>
            ))}
        </div>
    );
};

export default LanguageSelector;
