// src/components/Layout_c.tsx

import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutGrid, ShoppingBag, User, LogOut, ChevronDown, Menu, X,
    Newspaper, Tag, ShoppingCart // Added ShoppingCart
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';

interface LayoutProps {
  onLogout: () => void;
  currentUser: any;
}

const ModernFooter: React.FC = () => (
    <footer className="w-full bg-transparent text-gray-500 dark:text-gray-400 flex-shrink-0 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm text-center md:text-left">
                    &copy; {new Date().getFullYear()} किsan Shakti. Connecting Farmers and Consumers.
                </p>
            </div>
        </div>
    </footer>
);


const Layout_c: React.FC<LayoutProps> = ({ onLogout, currentUser }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/consumer-dashboard', icon: LayoutGrid, key: 'dashboard_c', name: 'Dashboard' },
    { path: '/products', icon: ShoppingBag, key: 'products_c', name: 'Products' },
    { path: '/consumer-blog', icon: Newspaper, key: 'blog_c', name: 'Blog' },
    { path: '/sell', icon: Tag, key: 'sell_c', name: 'Sell' },
    { path: '/consumer-cart', icon: ShoppingCart, key: 'cart_c', name: 'Cart' }, // Added Cart
    { path: '/consumer-profile', icon: User, key: 'profile_c', name: 'Profile' },
  ];

  const currentPage = navItems.find(item => item.path === location.pathname);
  const pageTitle = currentPage ? currentPage.name : 'Dashboard';

  const NavLinks: React.FC<{ onLinkClick?: () => void }> = ({ onLinkClick }) => (
    <nav className="flex-grow p-4 space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onLinkClick}
            className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Icon className="w-6 h-6 flex-shrink-0" />
            <span className="font-medium whitespace-nowrap">
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex">
      <aside className="hidden lg:block w-64 fixed left-4 top-4 bottom-4 z-50">
          <div className="h-full bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg flex flex-col">
              <div className="p-6 flex items-center gap-3 flex-shrink-0">
                  <img src="/logo.png" alt="Kisan Shakti Logo" className="w-10 h-10" />
                  <div>
                    <span className="font-bold text-gray-800 dark:text-gray-100 text-xl whitespace-nowrap">किsan Shakti</span>
                  </div>
              </div>
              <NavLinks />
          </div>
      </aside>

      <div className="flex-1 flex flex-col lg:pl-72">
          <header className="sticky top-0 z-40 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-lg w-full">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between h-20 border-b border-gray-200 dark:border-gray-700">
                      <div className="lg:hidden">
                          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2">
                              <Menu className="w-6 h-6" />
                          </button>
                      </div>
                      <h1 className="hidden lg:block text-2xl font-bold text-gray-900 dark:text-white">{pageTitle}</h1>
                      
                      <h1 className="lg:hidden text-xl font-bold text-gray-900 dark:text-white absolute left-1/2 -translate-x-1/2">{pageTitle}</h1>

                      <div className="flex items-center gap-4">
                          <div className="hidden lg:flex items-center gap-2">
                             <LanguageSwitcher />
                             <ThemeSwitcher />
                          </div>
                          <div className="relative group">
                              <button className="flex items-center gap-2 p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                 <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                                   <User className="w-5 h-5 text-white" />
                                 </div>
                                  <span className="hidden sm:inline font-medium text-sm">{currentUser.name?.split(' ')[0] || 'User'}</span>
                                  <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:inline"/>
                              </button>
                              <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                  <Link to="/consumer-profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                      <User className="w-4 h-4"/> Profile
                                  </Link>
                                  <button onClick={onLogout} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                                      <LogOut className="w-4 h-4"/> Logout
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </header>

          <main className="flex-grow p-4 sm:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto">
                  <Outlet />
              </div>
          </main>
          
          <ModernFooter />
      </div>

      <div className={`fixed inset-0 z-50 lg:hidden transition-transform transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className="relative w-72 h-full bg-white dark:bg-gray-800 shadow-xl flex flex-col">
            <div className="p-6 flex items-center justify-between flex-shrink-0 border-b dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="Kisan Shakti Logo" className="w-10 h-10" />
                    <span className="font-bold text-gray-800 dark:text-gray-100 text-xl">Kisan Shakti</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2"><X className="w-6 h-6" /></button>
            </div>
            <NavLinks onLinkClick={() => setIsMobileMenuOpen(false)} />
            <div className="p-4 mt-auto border-t dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <LanguageSwitcher />
                    <ThemeSwitcher />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Layout_c;