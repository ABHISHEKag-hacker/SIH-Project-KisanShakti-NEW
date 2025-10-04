// src/pages/consumer/Products_c.tsx

import React, { useState, useEffect } from 'react';
import { db, auth } from '../../services/firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { ShoppingBag, Tag, PawPrint, ShoppingCart, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Listing {
  id?: string;
  name: string;
  type: 'Cattle' | 'Crop';
  price: number;
  quantity: string; // The available quantity from the farmer (e.g., "10", "5 quintal")
  imageUrl: string;
  sellerId: string;
}

const Products_c: React.FC = () => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'listings'));
                const fetchedListings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
                setListings(fetchedListings);
            } catch (error) {
                console.error("Error fetching listings: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, []);

    const handleQuantityChange = (product: Listing, change: number) => {
        const productId = product.id!;
        // Extract the numerical part of the quantity string (e.g., "10 quintal" -> 10)
        const availableStock = parseInt(product.quantity, 10) || 1;

        setQuantities(prev => {
            const currentQuantity = prev[productId] || 1;
            // Ensure new quantity is between 1 and the available stock
            const newQuantity = Math.max(1, Math.min(currentQuantity + change, availableStock));
            return {
                ...prev,
                [productId]: newQuantity
            };
        });
    };

    const handleAddToCart = async (product: Listing) => {
        const user = auth.currentUser;
        if (!user) {
            alert("Please log in to add items to your cart.");
            return;
        }

        const quantityToAdd = quantities[product.id!] || 1;

        try {
            const cartRef = collection(db, 'users', user.uid, 'cart');
            await addDoc(cartRef, {
                productId: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                sellerId: product.sellerId,
                quantity: quantityToAdd,
                totalPrice: product.price * quantityToAdd,
                addedAt: serverTimestamp()
            });
            alert(`${quantityToAdd} x ${product.name} has been added to your cart!`);
        } catch (error) {
            console.error("Error adding to cart: ", error);
            alert("Failed to add item to cart.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border p-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-3">
                    <ShoppingBag className="w-8 h-8 text-green-600" />
                    Farmer's Market
                </h1>

                {loading ? (
                    <p className="text-center py-8">Loading products...</p>
                ) : listings.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No products are currently listed by farmers.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {listings.map(item => (
                            <div key={item.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 flex flex-col">
                                <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                                <div className="flex-grow">
                                    <h3 className="font-bold text-lg">{item.name}</h3>
                                    <p className={`flex items-center gap-2 text-sm ${item.type === 'Cattle' ? 'text-orange-500' : 'text-green-500'}`}>
                                        {item.type === 'Cattle' ? <PawPrint size={14} /> : <Tag size={14} />}
                                        {item.type}
                                    </p>
                                </div>
                                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                                    <p className="text-xl font-semibold text-green-600">₹{item.price.toLocaleString()}</p>
                                    <p className="text-sm text-gray-500">Available: {item.quantity}</p>
                                </div>

                                {/* Quantity Selector and Add to Cart Button */}
                                <div className="mt-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="font-medium text-sm">Quantity:</label>
                                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                                            <button onClick={() => handleQuantityChange(item, -1)} className="px-3 py-1 text-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 rounded-l-md">
                                                <Minus size={16} />
                                            </button>
                                            <span className="px-4 py-1 font-semibold">{quantities[item.id!] || 1}</span>
                                            <button onClick={() => handleQuantityChange(item, 1)} className="px-3 py-1 text-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 rounded-r-md">
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <button onClick={() => handleAddToCart(item)} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                                        <ShoppingCart size={18} /> Add to Cart
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products_c;