// src/pages/consumer/Cart_c.tsx

import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ShoppingCart, Trash2 } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  totalPrice?: number; // Made totalPrice optional to handle old data
}

interface CartPageProps {
  currentUser: any;
}

const Cart_c: React.FC<CartPageProps> = ({ currentUser }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchCartItems = async () => {
      setLoading(true);
      try {
        const cartRef = collection(db, 'users', currentUser.uid, 'cart');
        const querySnapshot = await getDocs(cartRef);
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CartItem));
        setCartItems(items);
      } catch (error) {
        console.error("Error fetching cart items: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [currentUser]);

  const handleRemoveItem = async (itemId: string) => {
    if (!currentUser) return;

    if (window.confirm("Are you sure you want to remove this item?")) {
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'cart', itemId));
            setCartItems(prev => prev.filter(item => item.id !== itemId));
        } catch (error) {
            console.error("Error removing item: ", error);
        }
    }
  };

  const getTotal = () => {
      // Safely calculate total, falling back to price * quantity if totalPrice is missing
      return cartItems.reduce((total, item) => {
          const itemTotal = item.totalPrice || (item.price * item.quantity);
          return total + (isNaN(itemTotal) ? 0 : itemTotal);
      }, 0);
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border p-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-3">
        <ShoppingCart className="w-8 h-8 text-blue-600" />
        Your Shopping Cart
      </h1>

      {loading ? (
        <p className="text-center text-gray-500 py-8">Loading your cart...</p>
      ) : !currentUser ? (
        <p className="text-center text-gray-500 py-8">Please log in to see your cart.</p>
      ) : cartItems.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Your cart is empty.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
                {cartItems.map(item => {
                    // **THE FIX IS HERE:** Safely determine the price to display.
                    const displayPrice = item.totalPrice || (item.price * item.quantity);
                    return (
                        <div key={item.id} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                            <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-md"/>
                            <div className="flex-grow">
                                <h3 className="font-semibold">{item.name}</h3>
                                <p className="text-sm text-gray-500">Quantity: {item.quantity || 1}</p>
                                <p className="font-bold text-green-600">
                                    {/* Safely call toLocaleString only on valid numbers */}
                                    ₹{typeof displayPrice === 'number' ? displayPrice.toLocaleString() : 'N/A'}
                                </p>
                            </div>
                            <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 p-2">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    )
                })}
            </div>
            <div className="lg:col-span-1">
                <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                    <div className="flex justify-between mb-2">
                        <span>Subtotal</span>
                        <span>₹{getTotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-4">
                        <span>Shipping</span>
                        <span>FREE</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>₹{getTotal().toLocaleString()}</span>
                    </div>
                    <button className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold">
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Cart_c;