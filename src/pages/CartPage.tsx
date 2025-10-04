import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const CartPage: React.FC = () => {
  const { translations, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    if (location.state?.cartItems) {
      setCartItems(location.state.cartItems);
    }
  }, [location.state]);

  const getTotalAmount = () => {
    return cartItems.reduce((sum: number, item: any) => sum + item.price, 0);
  };

  const handlePlaceOrder = () => {
    // In a real application, you would send this data to your database
    // for processing and payment handling.
    console.log('Placing order with items:', cartItems);
    alert('Order placed successfully!');
    setCartItems([]);
    navigate('/marketplace');
  };

  const handleRemoveItem = (indexToRemove: number) => {
    setCartItems(currentItems => currentItems.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-green-600" />
          {translations.cart?.[language] || 'Shopping Cart'}
        </h1>

        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-gray-600" />
            Order Summary
          </h2>
          <div className="space-y-3">
            {cartItems.length > 0 ? (
              cartItems.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center text-gray-700 bg-white p-3 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-600">₹{item.price}</p>
                  </div>
                  <button onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 transition-colors">
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600 py-4">Your cart is empty</p>
            )}
          </div>
          
          {cartItems.length > 0 && (
            <>
              <div className="border-t pt-4 mt-4 flex justify-between font-bold text-xl">
                <span>Total:</span>
                <span className="text-green-600">₹{getTotalAmount()}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2 mt-4"
              >
                <CheckCircle className="w-5 h-5" />
                Place Order
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;