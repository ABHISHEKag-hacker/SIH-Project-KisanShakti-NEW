// src/pages/ProfilePage.tsx

import React, { useState, useEffect } from 'react';
import { User, LogOut, Phone, MapPin, Edit, Save, X, Mail, Sprout, Droplets, Banknote, Trash2 } from 'lucide-react';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { deleteUser } from 'firebase/auth';
import AuthWindow from '../components/AuthWindow';

interface ProfilePageProps {
  currentUser: any;
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<any>(null);
  const [showAuthWindow, setShowAuthWindow] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setEditedUser(JSON.parse(JSON.stringify(currentUser)));
    }
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser?.uid) return;
    try {
      if (editedUser.farmerProfile.city && editedUser.farmerProfile.state) {
        editedUser.location = `${editedUser.farmerProfile.city}, ${editedUser.farmerProfile.state}`;
      }
      const userDocRef = doc(db, 'farmers', currentUser.uid);
      await setDoc(userDocRef, editedUser, { merge: true });
      localStorage.setItem('farmwise_user', JSON.stringify(editedUser));
      setIsEditing(false);
      alert('Profile saved successfully!');
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to save profile.");
    }
  };
  
  const handleCancel = () => {
    setEditedUser(JSON.parse(JSON.stringify(currentUser)));
    setIsEditing(false);
  };
  
  const handleDeleteProfile = async () => {
    if (!window.confirm("Are you sure? This will permanently delete your profile and all associated data. This action cannot be undone.")) {
      return;
    }
    
    const user = auth.currentUser;
    if (user && user.uid === currentUser.uid) {
      try {
        // Delete the Firestore document first.
        await deleteDoc(doc(db, 'farmers', user.uid));
        
        // This will delete the user and automatically trigger the onAuthStateChanged listener in App.tsx.
        await deleteUser(user);
        
        alert('Your profile has been permanently deleted.');
        // No need to call onLogout() here, the listener handles it.
        
      } catch (error: any) {
        console.error("Error deleting profile:", error);
        if (error.code === 'auth/requires-recent-login') {
            alert("This is a sensitive operation and requires you to log in again. Please log out, log back in, and then try deleting your profile again.");
        } else {
            alert(`Failed to delete profile: ${error.message}`);
        }
      }
    } else {
        alert("Could not verify user. Please try logging in again.");
    }
  };
  
  const handleProfileChange = (key: string, value: any) => {
      setEditedUser((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleFarmerProfileChange = (key: string, value: any) => {
    const finalValue = key === 'cropGrown' ? value.split(',').map((c:string) => c.trim()) : value;
    setEditedUser((prev: any) => ({
      ...prev,
      farmerProfile: { ...(prev.farmerProfile || {}), [key]: finalValue },
    }));
  };
  
  const Field = ({ label, value, icon: Icon }: { label: string; value: string | undefined, icon?: React.ElementType }) => (
    <div>
      <p className="text-sm text-gray-400">{label}</p>
      <div className="flex items-center gap-2 mt-1">
          {Icon && <Icon className="w-4 h-4 text-green-400" />}
          <p className="font-semibold text-white">{value || 'N/A'}</p>
      </div>
    </div>
  );

  const EditField = ({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string }) => (
      <div>
          <p className="text-sm text-gray-400">{label}</p>
          <input type={type} value={value || ''} onChange={onChange} className="mt-1 w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2 px-3"/>
      </div>
  );
  
  const FarmingProfileTile = ({ icon: Icon, title, data, isEditing, onChange }: { icon: React.ElementType, title: string, data: any[], isEditing: boolean, onChange: (key: string, value: any) => void }) => (
      <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
              <Icon className="w-5 h-5 text-green-400" />
              <h4 className="font-bold text-white">{title}</h4>
          </div>
          <div className="space-y-3">
              {data.map(field => (
                <div key={field.label}>
                    <p className="text-sm text-gray-400">{field.label}:</p>
                    {isEditing ? (
                        <input type={field.type || 'text'} value={field.value || ''} onChange={(e) => onChange(field.key, e.target.value)} className="mt-1 w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2 px-3"/>
                    ) : (
                        <p className="text-white font-medium">{field.displayValue || 'N/A'}</p>
                    )}
                </div>
              ))}
          </div>
      </div>
  );

  if (!currentUser || !editedUser) {
     return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <User className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Welcome to Your Profile</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to view and manage your profile</p>
            <button onClick={() => setShowAuthWindow(true)} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">Login / Sign Up</button>
            {showAuthWindow && (<AuthWindow isOpen={showAuthWindow} onClose={() => setShowAuthWindow(false)} onLogin={(userData) => {localStorage.setItem('farmwise_user', JSON.stringify(userData)); window.location.reload();}}/>)}
          </div>
        </div>
      );
  }

  return (
    <div className="bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8 rounded-2xl">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white">{editedUser.name}</h2>
                    <p className="text-gray-400 flex items-center gap-2 mt-1"><MapPin className="w-4 h-4" />{editedUser.location}</p>
                </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
                {isEditing ? (
                    <>
                        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"><Save size={16} /> Save</button>
                        <button onClick={handleCancel} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"><X size={16} /> Cancel</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"><Edit size={16} /> Edit Profile</button>
                        <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"><LogOut size={16} /> Logout</button>
                    </>
                )}
            </div>
        </div>
        
        <div className="border-t border-b border-gray-700 py-8 mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {isEditing ? <EditField label="Name" value={editedUser.name} onChange={(e) => handleProfileChange('name', e.target.value)} /> : <Field label="Name" value={editedUser.name} />}
            {isEditing ? <EditField label="Phone" value={editedUser.phone} onChange={(e) => handleProfileChange('phone', e.target.value)} /> : <Field label="Phone" value={editedUser.phone} icon={Phone} />}
            <Field label="Email" value={editedUser.email} />
            <Field label="Location" value={editedUser.location} icon={MapPin} />
        </div>
        
        <div>
            <div className="flex items-center gap-3 mb-6"><Sprout className="w-6 h-6 text-green-400" /><h3 className="text-2xl font-bold text-white">Farming Profile</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FarmingProfileTile icon={MapPin} title="Land Details" isEditing={isEditing} onChange={handleFarmerProfileChange} data={[
                    { label: 'Size', key: 'landSize', value: editedUser.farmerProfile?.landSize, displayValue: `${editedUser.farmerProfile?.landSize} acres`, type: 'number' },
                    { label: 'Ownership', key: 'landOwnership', value: editedUser.farmerProfile?.landOwnership, displayValue: editedUser.farmerProfile?.landOwnership },
                    { label: 'Soil Type', key: 'soilType', value: editedUser.farmerProfile?.soilType, displayValue: editedUser.farmerProfile?.soilType },
                ]}/>
                <FarmingProfileTile icon={Sprout} title="Crops & Farming" isEditing={isEditing} onChange={handleFarmerProfileChange} data={[
                    { label: 'Crops', key: 'cropGrown', value: editedUser.farmerProfile?.cropGrown?.join(', '), displayValue: editedUser.farmerProfile?.cropGrown?.join(', ') },
                    { label: 'Type', key: 'farmingType', value: editedUser.farmerProfile?.farmingType, displayValue: editedUser.farmerProfile?.farmingType },
                    { label: 'Experience', key: 'farmingExperience', value: editedUser.farmerProfile?.farmingExperience, displayValue: `${editedUser.farmerProfile?.farmingExperience} years`, type: 'number' },
                ]}/>
                <FarmingProfileTile icon={Droplets} title="Water Resources" isEditing={isEditing} onChange={handleFarmerProfileChange} data={[
                    { label: 'Source', key: 'irrigationSource', value: editedUser.farmerProfile?.irrigationSource, displayValue: editedUser.farmerProfile?.irrigationSource },
                    { label: 'Availability', key: 'waterAvailability', value: editedUser.farmerProfile?.waterAvailability, displayValue: editedUser.farmerProfile?.waterAvailability },
                ]}/>
                <FarmingProfileTile icon={Banknote} title="Banking" isEditing={isEditing} onChange={handleFarmerProfileChange} data={[
                    { label: 'Bank Acc', key: 'bankAccount', value: editedUser.farmerProfile?.bankAccount, displayValue: editedUser.farmerProfile?.bankAccount },
                    { label: 'Aadhaar', key: 'aadhaarLinked', value: editedUser.farmerProfile?.aadhaarLinked, displayValue: editedUser.farmerProfile?.aadhaarLinked },
                ]}/>
            </div>
        </div>

        {!isEditing && (
             <div className="mt-12 pt-8 border-t border-gray-700">
                <h3 className="text-xl font-bold text-red-400">Danger Zone</h3>
                <div className="bg-gray-800 p-4 rounded-lg mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <p className="font-semibold text-white">Delete your account</p>
                        <p className="text-sm text-gray-400">Once you delete your account, there is no going back. Please be certain.</p>
                    </div>
                    <button 
                        onClick={handleDeleteProfile} 
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors flex-shrink-0"
                    >
                        <Trash2 size={16} />
                        Delete Profile Permanently
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;