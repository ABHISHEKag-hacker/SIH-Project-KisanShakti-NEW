// src/pages/DashboardPage.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Cloud, TrendingUp, Shield, Gift, Beaker, ShoppingBag, ArrowRight, Star, Award } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardPageProps {
  currentUser: any;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ currentUser }) => {
  const { translations, language } = useLanguage();
  const T = translations.dashboardPage || {};

  const features = [
    { icon: Cloud, title: T.weatherTitle?.[language] || 'Weather Forecast', description: T.weatherDesc?.[language] || 'Get accurate weather predictions and alerts for your location.', path: '/weather', color: 'blue' },
    { icon: TrendingUp, title: T.mspTitle?.[language] || 'MSP Updates', description: T.mspDesc?.[language] || 'Stay updated with minimum support prices for all your crops.', path: '/msp', color: 'green' },
    { icon: Shield, title: T.insuranceTitle?.[language] || 'Crop Insurance', description: T.insuranceDesc?.[language] || 'Protect your crops with comprehensive insurance coverage options.', path: '/insurance', color: 'purple' },
    { icon: Gift, title: T.schemesTitle?.[language] || 'Government Schemes', description: T.schemesDesc?.[language] || 'Access PM-Kisan, Soil Health Card, and other farmer schemes.', path: '/schemes', color: 'orange' },
    { icon: Beaker, title: T.soilTitle?.[language] || 'Soil Analysis', description: T.soilDesc?.[language] || 'Upload soil reports and get personalized fertilizer advice.', path: '/soil', color: 'indigo' },
    { icon: ShoppingBag, title: T.marketplaceTitle?.[language] || 'Marketplace', description: T.marketplaceDesc?.[language] || 'Buy quality seeds, fertilizers, and equipment at the best prices.', path: '/marketplace', color: 'red' }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'green': return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'purple': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      case 'orange': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
      case 'indigo': return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400';
      case 'red': return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };
  
  // Extracting user-specific data with fallbacks
  const primaryCrop = currentUser?.farmerProfile?.cropGrown?.[0] || T.notSet?.[language] || 'Not Set';
  const schemesAppliedCount = currentUser?.farmerProfile?.schemesApplied?.length || 0;
  const location = currentUser?.location || 'your area';

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          {T.welcome?.[language] || 'Welcome back'},
          <span className="text-green-600 block mt-2">{currentUser.name?.split(' ')[0] || T.farmer?.[language] || 'Farmer'}!</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
          {T.summary?.[language] || 'Here is your personalized farm summary for'} {location}. {T.productive?.[language] || "Let's make today a productive one."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/weather"
            className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-colors font-semibold text-lg flex items-center justify-center gap-2"
          >
            {T.checkForecast?.[language] || 'Check Full Forecast'}
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/marketplace"
            className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-xl hover:bg-green-50 dark:hover:bg-gray-800 transition-colors font-semibold text-lg"
          >
            {T.goToMarketplace?.[language] || 'Go to Marketplace'}
          </Link>
        </div>
      </section>

      {/* Personalized Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-4xl font-bold text-green-600 mb-2 flex items-center justify-center gap-2"><Sprout/></div>
            <div className="text-gray-600 dark:text-gray-400">{T.primaryCrop?.[language] || 'Your Primary Crop'}</div>
            <div className="text-xl font-semibold text-gray-800 dark:text-gray-200">{primaryCrop}</div>
          </div>
          <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-4xl font-bold text-green-600 mb-2 flex items-center justify-center gap-2"><Award/></div>
            <div className="text-gray-600 dark:text-gray-400">{T.schemesApplied?.[language] || 'Schemes Applied'}</div>
            <div className="text-xl font-semibold text-gray-800 dark:text-gray-200">{schemesAppliedCount}</div>
          </div>
          <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-4xl font-bold text-green-600 mb-2">3 / 5</div>
            <div className="text-gray-600 dark:text-gray-400">{T.referralProgress?.[language] || 'Referral Progress'}</div>
            <div className="text-xl font-semibold text-gray-800 dark:text-gray-200">{T.nextReward?.[language] || 'Next: ₹500 Voucher'}</div>
          </div>
          <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-4xl font-bold text-green-600 mb-2 flex items-center justify-center gap-2">4.8 <Star className="w-8 h-8"/></div>
            <div className="text-gray-600 dark:text-gray-400">{T.appRating?.[language] || 'App Rating'}</div>
            <div className="text-xl font-semibold text-gray-800 dark:text-gray-200">{T.joinFarmers?.[language] || 'Join 50k+ Farmers'}</div>
          </div>
        </section>

      {/* Features Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">{T.exploreTools?.[language] || 'Explore Your Tools'}</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">{T.maximizePotential?.[language] || "Comprehensive insights to maximize your farm's potential."}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link to={feature.path} key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className={`w-12 h-12 ${getColorClasses(feature.color)} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;