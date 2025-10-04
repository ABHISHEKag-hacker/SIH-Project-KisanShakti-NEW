// src/pages/consumer/Dashboard_c.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Newspaper, User, ArrowRight } from 'lucide-react';

const Dashboard_c: React.FC = () => {
  return (
    <div className="space-y-12">
        <section className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Welcome, Consumer!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore fresh produce directly from farmers, read insightful blogs, and manage your profile.
            </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/products" className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-5">
                <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Browse Products</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">Find fresh, high-quality produce and cattle directly from our network of farmers.</p>
            <div className="mt-auto text-green-600 dark:text-green-400 font-semibold flex items-center gap-2">
                Shop Now <ArrowRight size={18} />
            </div>
          </Link>

          <Link to="/consumer-blog" className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-5">
                <Newspaper className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Read & Write Blogs</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">Read the latest in agriculture or share your own stories and insights with the community.</p>
            <div className="mt-auto text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-2">
                Go to Blog <ArrowRight size={18} />
            </div>
          </Link>

          <Link to="/consumer-profile" className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-5">
                <User className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Manage Profile</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">Keep your personal information, preferences, and settings up to date.</p>
            <div className="mt-auto text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-2">
                Update Profile <ArrowRight size={18} />
            </div>
          </Link>
      </section>
    </div>
  );
};

export default Dashboard_c;