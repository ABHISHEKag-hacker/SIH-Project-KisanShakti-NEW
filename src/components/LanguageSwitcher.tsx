import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'od', name: 'Odia', native: 'ଓଡ଼ିଆ' }
  ];

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">
          {languages.find(l => l.code === language)?.native}
        </span>
      </button>
      
      <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[150px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 max-h-60 overflow-y-auto">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code as any)}
            className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
              language === lang.code ? 'bg-green-50 dark:bg-gray-900/50 text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="font-medium">{lang.native}</div>
            <div className="text-xs text-gray-500">{lang.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;