import React from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'hi', name: 'Hindi' }
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
        <div className="flex gap-2 relative group">
            <div className="hidden sm:flex bg-gray-50 p-1 rounded-lg border border-gray-200">
                {languages.map((lng) => (
                    <button
                        key={lng.code}
                        onClick={() => changeLanguage(lng.code)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${i18n.language === lng.code
                            ? 'bg-white text-green-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        {lng.name}
                    </button>
                ))}
            </div>

            {/* Mobile Dropdown */}
            <div className="sm:hidden">
                <select
                    value={i18n.language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-green-500"
                >
                    {languages.map((lng) => (
                        <option key={lng.code} value={lng.code}>
                            {lng.code.toUpperCase()}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
            </div>
        </div>
    );
};

export default LanguageSelector;
