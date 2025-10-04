// src/contexts/LanguageContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'mr' | 'ta' | 'bn' | 'te' | 'gu' | 'kn' | 'ml' | 'pa' | 'od';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: Record<string, any>;
}

const translations = {
  navigation: {
    dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड' },
    'farm-tracking': { en: 'Farm Tracking', hi: 'फार्म ट्रैकिंग' },
    weather: { en: 'Weather', hi: 'मौसम' },
    msp: { en: 'MSP', hi: 'एमएसपी' },
    insurance: { en: 'Insurance', hi: 'बीमा' },
    schemes: { en: 'Schemes', hi: 'योजनाएं' },
    soil: { en: 'Soil Report', hi: 'मिट्टी रिपोर्ट' },
    marketplace: { en: 'Marketplace', hi: 'बाज़ार' },
    cart: { en: 'Cart', hi: 'गाड़ी' },
    referral: { en: 'Referral', hi: 'रेफरल' },
    profile: { en: 'Profile', hi: 'प्रोफाइल' },
  },
  weatherPage: {
    weatherCenter: { en: 'Weather Center', hi: 'मौसम केंद्र' },
    currentTemp: { en: 'Current Temperature', hi: 'वर्तमान तापमान' },
    feelsLike: { en: 'Feels Like', hi: 'जैसा लगता है' },
    humidity: { en: 'Humidity', hi: 'आर्द्रता' },
    windSpeed: { en: 'Wind Speed', hi: 'हवा की गति' },
    historicalWeather: { en: 'Historical Analysis', hi: 'ऐतिहासिक विश्लेषण' },
    days: { en: 'Days', hi: 'दिन' },
    weeks: { en: 'Weeks', hi: 'सप्ताह' },
    months: { en: 'Months', hi: 'महीने' },
    years: { en: 'Years', hi: 'वर्ष' },
    avgTemp: { en: 'Avg Temperature', hi: 'औसत तापमान' },
    totalRainfall: { en: 'Total Rainfall', hi: 'कुल वर्षा' },
    alertTitle: { en: 'Extreme Heatwave Warning', hi: 'भीषण गर्मी की चेतावनी' },
    alertAdvice: { en: 'Apply light and frequent irrigation. Use shade nets.', hi: 'हलकी और बार-बार सिंचाई करें। शेड नेट का प्रयोग करें।' },
  },
  dashboardPage: {
    welcome: { en: 'Welcome back', hi: 'वापसी पर स्वागत है' },
    farmer: { en: 'Farmer', hi: 'किसान' },
    summary: { en: 'Here is your personalized farm summary for', hi: 'यह आपके लिए व्यक्तिगत कृषि सारांश है' },
    productive: { en: "Let's make today a productive one.", hi: 'आइए आज के दिन को उत्पादक बनाएं।' },
    checkForecast: { en: 'Check Full Forecast', hi: 'पूरा पूर्वानुमान देखें' },
    goToMarketplace: { en: 'Go to Marketplace', hi: 'बाजार पर जाएं' },
    primaryCrop: { en: 'Your Primary Crop', hi: 'आपकी मुख्य फसल' },
    notSet: { en: 'Not Set', hi: 'निर्धारित नहीं है' },
    schemesApplied: { en: 'Schemes Applied', hi: 'लागू योजनाएं' },
    referralProgress: { en: 'Referral Progress', hi: 'रेफरल प्रगति' },
    nextReward: { en: 'Next: ₹500 Voucher', hi: 'अगला: ₹500 वाउचर' },
    appRating: { en: 'App Rating', hi: 'ऐप रेटिंग' },
    joinFarmers: { en: 'Join 50k+ Farmers', hi: '50k+ किसानों से जुड़ें' },
    exploreTools: { en: 'Explore Your Tools', hi: 'अपने टूल एक्सप्लोर करें' },
    maximizePotential: { en: "Comprehensive insights to maximize your farm's potential.", hi: 'अपनी कृषि की क्षमता को अधिकतम करने के लिए व्यापक अंतर्दृष्टि।' },
    weatherTitle: { en: 'Weather Forecast', hi: 'मौसम पूर्वानुमान' },
    weatherDesc: { en: 'Get accurate weather predictions and alerts for your location.', hi: 'अपने स्थान के लिए सटीक मौसम की भविष्यवाणी और अलर्ट प्राप्त करें।' },
    mspTitle: { en: 'MSP Updates', hi: 'एमएसपी अपडेट' },
    mspDesc: { en: 'Stay updated with minimum support prices for all your crops.', hi: 'अपनी सभी फसलों के लिए न्यूनतम समर्थन मूल्यों के साथ अपडेट रहें।' },
    insuranceTitle: { en: 'Crop Insurance', hi: 'फसल बीमा' },
    insuranceDesc: { en: 'Protect your crops with comprehensive insurance coverage options.', hi: 'व्यापक बीमा कवरेज विकल्पों के साथ अपनी फसलों की रक्षा करें।' },
    schemesTitle: { en: 'Government Schemes', hi: 'सरकारी योजनाएं' },
    schemesDesc: { en: 'Access PM-Kisan, Soil Health Card, and other farmer schemes.', hi: 'पीएम-किसान, मृदा स्वास्थ्य कार्ड और अन्य किसान योजनाओं तक पहुंचें।' },
    soilTitle: { en: 'Soil Analysis', hi: 'मृदा विश्लेषण' },
    soilDesc: { en: 'Upload soil reports and get personalized fertilizer advice.', hi: 'मृदा रिपोर्ट अपलोड करें और व्यक्तिगत उर्वरक सलाह प्राप्त करें।' },
    marketplaceTitle: { en: 'Marketplace', hi: 'बाजार' },
    marketplaceDesc: { en: 'Buy quality seeds, fertilizers, and equipment at the best prices.', hi: 'गुणवत्ता वाले बीज, उर्वरक और उपकरण सर्वोत्तम मूल्यों पर खरीदें।' },
  },
  common: {
    loading: { en: 'Loading...', hi: 'लोड हो रहा है...' },
  }
};


const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};