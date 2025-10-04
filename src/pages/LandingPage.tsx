// src/pages/LandingPage.tsx

import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { Sprout, Cloud, TrendingUp, Shield, Gift, Beaker, ShoppingBag, ArrowRight, Star } from 'lucide-react';
import ThemeSwitcher from '../components/ThemeSwitcher';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const features = [
    { icon: Cloud, title: 'Weather Forecast', description: 'Accurate weather predictions for better crop planning.' },
    { icon: TrendingUp, title: 'MSP Updates', description: 'Stay updated with government minimum support prices.' },
    { icon: Shield, title: 'Crop Insurance', description: 'Protect your crops with comprehensive insurance options.' },
    { icon: Gift, title: 'Government Schemes', description: 'Access PM-Kisan, Soil Health Cards, and more.' },
    { icon: Beaker, title: 'Soil Analysis', description: 'Get personalized fertilizer recommendations from reports.' },
    { icon: ShoppingBag, title: 'Marketplace', description: 'Buy quality seeds, fertilizers, and equipment.' }
  ];

  const testimonials = [
    { name: 'Ramesh Patel', location: 'Gujarat', text: 'Kisan Shakti helped me increase my crop yield by 30% with their accurate weather planning. A game-changer!', rating: 5 },
    { name: 'Sunita Devi', location: 'Punjab', text: 'The soil analysis feature is incredible. It saved me a lot on unnecessary fertilizers this season.', rating: 5 },
    { name: 'Krishnan Reddy', location: 'Andhra Pradesh', text: 'Easy access to government schemes helped me get my PM-Kisan benefits quickly and without any hassle.', rating: 5 }
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Kisan Shakti Logo" className="w-10 h-10" />
            <span className="font-bold text-xl text-gray-800 dark:text-gray-100">किsan Shakti</span>
          </div>
          <div className="flex items-center gap-4">
             <Link to="/blog" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">Blog</Link> {/* Add blog link */}
            <ThemeSwitcher />
            <button
              onClick={onGetStarted}
              className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-sm hover:shadow-md"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-lime-50 via-gray-50 to-emerald-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-800 dark:text-gray-100">
              Smarter Farming, Brighter Future
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
              One platform for weather, MSP rates, crop insurance, government schemes, soil analysis, and marketplace access.
            </p>
            <button
              onClick={onGetStarted}
              className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-all font-bold text-lg flex items-center justify-center gap-2 mx-auto shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300"
            >
              Start Farming Smarter <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white dark:bg-gray-800/50 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-gray-800 dark:text-gray-100">Everything a Modern Farmer Needs</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Our tools provide you with the data and insights to maximize your farm's potential and profitability.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-5 mx-auto">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-gray-800 dark:text-gray-100">Trusted by Farmers Across India</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t) => (
                <div key={t.name} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 text-center">
                  <div className="flex items-center justify-center gap-1 mb-5">
                    {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 italic">"{t.text}"</p>
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">{t.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-green-600">
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your Farming?</h2>
            <p className="text-xl text-green-100 mb-8">Join thousands of farmers using Kisan Shakti to increase profits and reduce risks.</p>
            <button
              onClick={onGetStarted}
              className="bg-white text-green-600 px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors font-bold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 duration-300"
            >
              Get Started For Free
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Kisan Shakti. Made with ❤️ for Indian farmers.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;