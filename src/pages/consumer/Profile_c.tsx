// src/pages/consumer/Profile_c.tsx

import React from 'react';
import { User, LogOut, Phone, MapPin } from 'lucide-react';

interface ProfilePageProps {
  currentUser: any;
  onLogout: () => void;
}

const Profile_c: React.FC<ProfilePageProps> = ({ currentUser, onLogout }) => {
  if (!currentUser) {
     return <div>Loading...</div>;
  }

  return (
    <div className="bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8 rounded-2xl">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white">{currentUser.name}</h2>
                    <p className="text-gray-400 flex items-center gap-2 mt-1"><MapPin className="w-4 h-4" />{currentUser.location}</p>
                </div>
            </div>
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold mt-4 sm:mt-0"><LogOut size={16} /> Logout</button>
        </div>
        
        <div className="border-t border-b border-gray-700 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <p className="text-sm text-gray-400">Name</p>
                <p className="font-semibold text-white">{currentUser.name || 'N/A'}</p>
            </div>
            <div>
                <p className="text-sm text-gray-400">Phone</p>
                <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4 text-blue-400" />
                    <p className="font-semibold text-white">{currentUser.phone || 'N/A'}</p>
                </div>
            </div>
            <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="font-semibold text-white">{currentUser.email || 'N/A'}</p>
            </div>
            <div>
                <p className="text-sm text-gray-400">Location</p>
                <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <p className="font-semibold text-white">{currentUser.location || 'N/A'}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile_c;