// src/pages/MarketplacePage.tsx

import React, { useState } from 'react';
import { ShoppingBag, Search, ShoppingCart, Tag, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const MarketplacePage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [cartItems, setCartItems] = useState<any[]>([]);

    const categories = [ { id: 'all', name: 'All Products' }, { id: 'seeds', name: 'Seeds' }, { id: 'fertilizers', name: 'Fertilizers' }, { id: 'pesticides', name: 'Pesticides' }, { id: 'equipment', name: 'Equipment' } ];
    const products = [ { id: 1, name: 'Hybrid Cotton Seeds', category: 'seeds', price: 1200, originalPrice: 1400, unit: 'packet', image: 'https://images.pexels.com/photos/4207901/pexels-photo-4207901.jpeg?auto=compress&cs=tinysrgb&w=200', rating: 4.5, discount: 15, seller: 'AgriSeeds Ltd.' }, { id: 2, name: 'Organic Fertilizer', category: 'fertilizers', price: 800, originalPrice: 900, unit: '25kg bag', image: 'https://images.pexels.com/photos/4505166/pexels-photo-4505166.jpeg?auto=compress&cs=tinysrgb&w=200', rating: 4.3, discount: 11, seller: 'GreenGrow Co.' }, { id: 3, name: 'Spray Pump Machine', category: 'equipment', price: 2500, originalPrice: 3000, unit: 'unit', image: 'https://images.pexels.com/photos/4505175/pexels-photo-4505175.jpeg?auto=compress&cs=tinysrgb&w=200', rating: 4.7, discount: 17, seller: 'FarmTech Solutions' }, { id: 4, name: 'Bio Pesticide', category: 'pesticides', price: 450, originalPrice: 500, unit: '1L bottle', image: 'https://images.pexels.com/photos/4207988/pexels-photo-4207988.jpeg?auto=compress&cs=tinysrgb&w=200', rating: 4.2, discount: 10, seller: 'EcoProtect' } ];
    const priceHistory = [ { month: 'Jan', price: 700 }, { month: 'Feb', price: 720 }, { month: 'Mar', price: 740 }, { month: 'Apr', price: 760 }, { month: 'May', price: 780 }, { month: 'Jun', price: 800 }, { month: 'Jul', price: 850 } ];
    const filteredProducts = selectedCategory === 'all' ? products : products.filter(p => p.category === selectedCategory);
    const addToCart = (product: any) => { setCartItems(prevItems => [...prevItems, product]); };

    return (
        <div className="space-y-6 pb-20 lg:pb-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-green-100 dark:border-gray-700 p-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-3"><ShoppingBag className="w-8 h-8 text-green-600" />Buy Farm Inputs</h1>
                
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1 relative"><Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" /><input type="text" placeholder="Search for seeds, fertilizers, equipment..." className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-transparent" /></div>
                        <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">Search</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (<button key={category.id} onClick={() => setSelectedCategory(category.id)} className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategory === category.id ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>{category.name}</button>))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
                            <div className="relative mb-4">
                                <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-lg" />
                                {product.discount > 0 && (<div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">{product.discount}% OFF</div>)}
                            </div>
                            <div className="mb-3"><h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{product.name}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{product.seller}</p></div>
                            <div className="flex items-center gap-2 mb-3">{[...Array(5)].map((_, i) => (<span key={i} className={`text-xs ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}>★</span>))}<span className="text-xs text-gray-600 dark:text-gray-400">({product.rating})</span></div>
                            <div className="mb-4"><div className="flex items-center gap-2"><span className="text-lg font-bold text-green-600 dark:text-green-400">₹{product.price}</span>{product.originalPrice > product.price && (<span className="text-sm text-gray-500 dark:text-gray-500 line-through">₹{product.originalPrice}</span>)}</div><span className="text-sm text-gray-600 dark:text-gray-400">per {product.unit}</span></div>
                            <button onClick={() => addToCart(product)} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">Add to Cart</button>
                        </div>
                    ))}
                </div>

                {cartItems.length > 0 && (<div className="text-center mt-6"><button onClick={() => navigate('/cart', { state: { cartItems } })} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mx-auto"><ShoppingCart className="w-5 h-5" />View Cart ({cartItems.length})</button></div>)}
            </div>
        </div>
    );
};
export default MarketplacePage;