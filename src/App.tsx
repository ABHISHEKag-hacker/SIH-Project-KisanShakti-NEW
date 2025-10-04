// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { auth, db } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Layouts
import Layout from './components/Layout';
import Layout_c from './components/Layout_c'; // Consumer Layout
import LandingPage from './pages/LandingPage';
import AuthWindow from './components/AuthWindow';

// Farmer Pages
import DashboardPage from './pages/DashboardPage';
import WeatherPage from './pages/WeatherPage';
import MSPPage from './pages/MSPPage';
import InsurancePage from './pages/InsurancePage';
import SchemesPage from './pages/SchemesPage';
import ReferralPage from './pages/ReferralPage';
import SoilReportPage from './pages/SoilReportPage';
import MarketplacePage from './pages/MarketplacePage';
import ProfilePage from './pages/ProfilePage';
import CheckoutPage from './pages/CheckoutPage';
import CartPage from './pages/CartPage';
import FarmTrackingPage from './pages/FarmTrackingPage';
import SellPage from './pages/SellPage';
import BlogPage from './pages/BlogPage';

// Consumer Pages
import Dashboard_c from './pages/consumer/Dashboard_c';
import Products_c from './pages/consumer/Products_c';
import Blog_c from './pages/consumer/Blog_c';
import Profile_c from './pages/consumer/Profile_c';
import Sell_c from './pages/consumer/sell_c';
import Cart_c from './pages/consumer/Cart_c'; // Make sure this import exists


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthWindow, setShowAuthWindow] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Corrected collection name from 'farmers' to 'users'
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const fullUserData = userDoc.data();
          setCurrentUser(fullUserData);
          localStorage.setItem('farmwise_user', JSON.stringify(fullUserData));
          setIsLoggedIn(true);
        } else {
          // This case handles if a user is authenticated but their Firestore doc is deleted.
          setIsLoggedIn(false);
          setCurrentUser(null);
          localStorage.removeItem('farmwise_user');
        }
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem('farmwise_user');
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setShowAuthWindow(false);
    localStorage.setItem('farmwise_user', JSON.stringify(user));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // The onAuthStateChanged listener will automatically handle the redirection.
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (authLoading) {
    return <div className="w-screen h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">Loading...</div>;
  }

  const renderRoutes = () => {
    if (!isLoggedIn) {
        return (
            <>
                <Route path="/" element={<LandingPage onGetStarted={() => setShowAuthWindow(true)} />} />
                <Route path="/blog" element={<BlogPage currentUser={null} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </>
        )
    }

    if (currentUser.role === 'farmer') {
        return (
            <Route path="/" element={<Layout onLogout={handleLogout} currentUser={currentUser} />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage currentUser={currentUser} />} />
                <Route path="weather" element={<WeatherPage currentUser={currentUser}/>} />
                <Route path="msp" element={<MSPPage />} />
                <Route path="insurance" element={<InsurancePage />} />
                <Route path="schemes" element={<SchemesPage />} />
                <Route path="referral" element={<ReferralPage />} />
                <Route path="soil" element={<SoilReportPage />} />
                <Route path="marketplace" element={<MarketplacePage />} />
                <Route path="profile" element={<ProfilePage currentUser={currentUser} onLogout={handleLogout} />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="farm-tracking" element={<FarmTrackingPage currentUser={currentUser} />} />
                <Route path="sell" element={<SellPage />} />
                <Route path="blog" element={<BlogPage currentUser={currentUser} />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
        )
    }

    if(currentUser.role === 'consumer') {
        return (
            <Route path="/" element={<Layout_c onLogout={handleLogout} currentUser={currentUser} />}>
                <Route index element={<Navigate to="/consumer-dashboard" replace />} />
                <Route path="consumer-dashboard" element={<Dashboard_c />} />
                <Route path="products" element={<Products_c />} />
                <Route path="consumer-blog" element={<Blog_c currentUser={currentUser} />} />
                <Route path="consumer-profile" element={<Profile_c currentUser={currentUser} onLogout={handleLogout} />} />
                <Route path="sell" element={<Sell_c />} />
                {/* This line is updated to pass the currentUser prop */}
                <Route path="consumer-cart" element={<Cart_c currentUser={currentUser} />} />
                <Route path="*" element={<Navigate to="/consumer-dashboard" replace />} />
            </Route>
        )
    }

    // Fallback for users with no role
    return <Route path="*" element={<Navigate to="/" replace />} />;
  }


  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            {renderRoutes()}
          </Routes>
          {!isLoggedIn && (
             <AuthWindow
              isOpen={showAuthWindow}
              onClose={() => setShowAuthWindow(false)}
              onLogin={handleAuthSuccess}
            />
          )}
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;