// client/src/components/LanguageToggle.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

function LanguageToggle() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex space-x-2 justify-center mb-4">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 rounded-full text-sm transition ${
          i18n.language === 'en'
            ? 'bg-blue-600 text-white font-semibold'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        English
      </button>
      <button
        onClick={() => changeLanguage('mr')}
        className={`px-3 py-1 rounded-full text-sm transition ${
          i18n.language === 'mr'
            ? 'bg-blue-600 text-white font-semibold'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        मराठी
      </button>
    </div>
  );
}

export default LanguageToggle;
