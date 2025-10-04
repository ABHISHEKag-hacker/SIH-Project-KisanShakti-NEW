import React from 'react';
import { ShoppingCart, CheckCircle, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cartItems = location.state?.cartItems || [];

  const getTotalAmount = () => {
    return cartItems.reduce((sum: number, item: any) => sum + item.price, 0);
  };

  const handlePlaceOrder = () => {
    // ⚠️ In a real application, you would send this data to your database
    // for processing and payment handling.
    console.log('Placing order with items:', cartItems);
    alert('Order placed successfully!');
    navigate('/marketplace');
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-green-600" />
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              Order Summary
            </h2>
            <div className="space-y-3">
              {cartItems.length > 0 ? (
                cartItems.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center text-gray-700">
                    <span>{item.name}</span>
                    <span>₹{item.price}</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600 py-4">No items in cart</p>
              )}
            </div>
            <div className="border-t pt-4 mt-4 flex justify-between font-bold text-xl">
              <span>Total:</span>
              <span className="text-green-600">₹{getTotalAmount()}</span>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Shipping & Payment
            </h2>
            <form onSubmit={(e) => { e.preventDefault(); handlePlaceOrder(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" className="mt-1 w-full p-2 border rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Shipping Address</label>
                <textarea className="mt-1 w-full p-2 border rounded-md" rows={3} required></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                Place Order
              </button>
            </form>
          </div>
        </div>

        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center gap-2 mt-8 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;