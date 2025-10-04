import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, PawPrint } from 'lucide-react';
import { db, auth } from '../services/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';

interface Listing {
  id?: string;
  name: string;
  type: 'Cattle' | 'Crop';
  price: number;
  quantity: string;
  imageUrl: string;
  sellerId: string;
}

const SellPage: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [newListing, setNewListing] = useState<Omit<Listing, 'sellerId'>>({
    name: '',
    type: 'Crop',
    price: 0,
    quantity: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);

  const fetchListings = async () => {
    const user = auth.currentUser;
    if (user) {
      const q = query(collection(db, 'listings'), where('sellerId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const userListings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
      setListings(userListings);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleAddListing = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to create a listing.");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'listings'), { ...newListing, sellerId: user.uid });
      setNewListing({ name: '', type: 'Crop', price: 0, quantity: '', imageUrl: '' });
      fetchListings(); // Refresh the list after adding
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveListing = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
        try {
            await deleteDoc(doc(db, 'listings', id));
            fetchListings(); // Refresh the list
        } catch (error) {
            console.error("Error removing document: ", error);
        }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-3">
          <Tag className="w-8 h-8 text-green-600" />
          Sell Your Produce & Cattle
        </h1>

        {/* Add New Listing Form */}
        <form onSubmit={handleAddListing} className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border dark:border-gray-700 space-y-4 mb-8">
            <h2 className="text-xl font-semibold mb-4">Add a New Listing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Item Name (e.g., 'Gir Cow', 'Organic Wheat')" value={newListing.name} onChange={e => setNewListing({ ...newListing, name: e.target.value })} className="input" required />
                <select value={newListing.type} onChange={e => setNewListing({ ...newListing, type: e.target.value as any })} className="input">
                    <option value="Crop">Crop</option>
                    <option value="Cattle">Cattle</option>
                </select>
                <input type="number" placeholder="Price (₹)" value={newListing.price} onChange={e => setNewListing({ ...newListing, price: parseFloat(e.target.value) || 0 })} className="input" required />
                <input type="text" placeholder="Quantity (e.g., '10 quintal', '1')" value={newListing.quantity} onChange={e => setNewListing({ ...newListing, quantity: e.target.value })} className="input" required />
            </div>
             <input type="url" placeholder="Image URL" value={newListing.imageUrl} onChange={e => setNewListing({ ...newListing, imageUrl: e.target.value })} className="input w-full" required />
            <button type="submit" disabled={loading} className="button-primary flex items-center justify-center gap-2">
                <Plus /> {loading ? 'Adding...' : 'Add Listing'}
            </button>
        </form>

        {/* Your Listings */}
        <div>
            <h2 className="text-xl font-semibold mb-4">Your Active Listings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map(item => (
                    <div key={item.id} className="bg-white dark:bg-gray-800/50 rounded-xl p-4 shadow-sm border dark:border-gray-700">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover rounded-lg mb-4" />
                        <div className="flex justify-between items-start">
                           <div>
                             <h3 className="font-bold text-lg">{item.name}</h3>
                             <p className={`flex items-center gap-2 text-sm ${item.type === 'Cattle' ? 'text-orange-500' : 'text-green-500'}`}>
                                {item.type === 'Cattle' ? <PawPrint size={14} /> : <Tag size={14} />}
                                {item.type}
                            </p>
                           </div>
                           <button onClick={() => item.id && handleRemoveListing(item.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={18} /></button>
                        </div>
                        <div className="mt-2 pt-2 border-t dark:border-gray-700">
                           <p className="text-lg font-semibold text-green-600">₹{item.price.toLocaleString()}</p>
                           <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                    </div>
                ))}
            </div>
             {listings.length === 0 && <p className="text-center text-gray-500 py-8">You have no active listings.</p>}
        </div>
      </div>
    </div>
  );
};

export default SellPage;