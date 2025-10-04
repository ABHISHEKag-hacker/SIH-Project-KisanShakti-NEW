// src/components/AuthWindow.tsx

import React, { useState } from 'react';
import { X, Sprout, User, MapPin, Wind } from "lucide-react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import statesAndCities from '../data/statesAndCities.json';

// Interfaces
interface AuthWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: any) => void;
}
interface FarmerData {
  fullName: string; phoneNumber: string; state: string; city: string; landSize: string; landOwnership: string;
  soilType: string; cropGrown: string[]; farmingType: string; farmingExperience: string;
  irrigationSource: string; waterAvailability: string; bankAccount: string; aadhaarLinked: string;
}

// Step Indicator Component
const StepIndicator = ({ currentStep }: { currentStep: number }) => {
    const steps = [
        { num: 1, title: 'Personal', icon: User },
        { num: 2, title: 'Farming', icon: Sprout },
        { num: 3, title: 'Resources', icon: Wind },
    ];
    return (
        <div className="flex justify-between items-center px-2">
            {steps.map((step, index) => {
                const isActive = currentStep === step.num;
                const isCompleted = currentStep > step.num;
                return (
                    <React.Fragment key={step.num}>
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-green-600 text-white' : isCompleted ? 'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                                <step.icon size={20} />
                            </div>
                            <p className={`mt-2 text-xs font-semibold ${isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>{step.title}</p>
                        </div>
                        {index < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`}></div>}
                    </React.Fragment>
                );
            })}
        </div>
    );
};


const AuthWindow: React.FC<AuthWindowProps> = ({ isOpen, onClose, onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [step, setStep] = useState(1);

  const [farmerData, setFarmerData] = useState<FarmerData>({
    fullName: "", phoneNumber: "", state: "", city: "", landSize: "", landOwnership: "Owned",
    soilType: "Alluvial", cropGrown: [], farmingType: "Conventional", farmingExperience: "",
    irrigationSource: "Borewell", waterAvailability: "Moderate", bankAccount: "No", aadhaarLinked: "No",
  });
  
  const states = Object.keys(statesAndCities) as (keyof typeof statesAndCities)[];
  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDocRef = doc(db, "farmers", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists() || !userDoc.data().farmerProfile?.landSize) {
        setFarmerData(prev => ({ ...prev, fullName: user.displayName || '' }));
        setShowSignup(true); setStep(1);
      } else {
        onLogin(userDoc.data()); onClose();
      }
    } catch (error) {
      console.error("Google login failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('Authentication error.');
      const userData = {
        uid, name: farmerData.fullName, email: auth.currentUser?.email || null, phone: farmerData.phoneNumber,
        location: `${farmerData.city}, ${farmerData.state}`, farmerProfile: farmerData,
      };
      await setDoc(doc(db, "farmers", uid), userData, { merge: true });
      onLogin(userData); onClose();
    } catch (error) {
      console.error("Signup failed", error);
      alert("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FarmerData, value: string | string[]) => {
    setFarmerData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 relative text-center border-b dark:border-gray-700">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"><X /></button>
          <Sprout className="mx-auto w-12 h-12 text-white bg-green-500 rounded-full p-2" />
          <h2 className="text-2xl font-bold mt-3">Welcome to किsan Shakti</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{showSignup ? 'Complete your profile to get started' : 'Your Smart Farming Partner'}</p>
        </div>
        
        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {!showSignup ? (
            <div className="space-y-6 text-center animate-fade-in">
              <button onClick={handleGoogleLogin} disabled={loading} className="w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-white py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center gap-3 transition-colors font-semibold border border-gray-300 dark:border-gray-600 shadow-sm">
                <svg className="w-5 h-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 62.3l-66.5 64.6C305.5 102.7 274.6 96 248 96 173.3 96 112 157.3 112 232s61.3 136 136 136c74.2 0 124.3-52.6 128.6-98.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                Sign In with Google
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if(step === 3) handleSignup(); }}>
              <div className="mb-6">
                <StepIndicator currentStep={step} />
              </div>
              
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div><label className="label">Full Name *</label><input type="text" value={farmerData.fullName} onChange={(e) => handleInputChange("fullName", e.target.value)} className="input" required/></div>
                  <div><label className="label">Phone Number</label><input type="tel" value={farmerData.phoneNumber} onChange={(e) => handleInputChange("phoneNumber", e.target.value)} className="input"/></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="label">State *</label><select value={farmerData.state} onChange={(e) => handleInputChange("state", e.target.value)} className="input" required><option value="">Select</option>{states.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                    <div><label className="label">City *</label><select value={farmerData.city} onChange={(e) => handleInputChange("city", e.target.value)} className="input" disabled={!farmerData.state} required><option value="">Select</option>{farmerData.state && statesAndCities[farmerData.state as keyof typeof statesAndCities].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  </div>
                  <button type="button" onClick={nextStep} className="w-full button-primary mt-4">Next</button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                   <div className="grid grid-cols-2 gap-4">
                      <div><label className="label">Land (acres)*</label><input type="number" value={farmerData.landSize} onChange={(e) => handleInputChange("landSize", e.target.value)} className="input" required/></div>
                      <div><label className="label">Ownership</label><select value={farmerData.landOwnership} onChange={e => handleInputChange('landOwnership', e.target.value)} className="input"><option>Owned</option><option>Leased</option></select></div>
                      <div><label className="label">Soil Type</label><select value={farmerData.soilType} onChange={e => handleInputChange('soilType', e.target.value)} className="input"><option>Alluvial</option><option>Black</option><option>Red</option><option>Laterite</option><option>Other</option></select></div>
                      <div><label className="label">Experience</label><input type="number" value={farmerData.farmingExperience} onChange={(e) => handleInputChange("farmingExperience", e.target.value)} className="input"/></div>
                   </div>
                   <div><label className="label">Primary Crops</label><input type="text" placeholder="e.g. Wheat, Cotton" value={farmerData.cropGrown.join(', ')} onChange={(e) => handleInputChange("cropGrown", e.target.value.split(',').map(c => c.trim()))} className="input"/></div>
                   <div className="flex gap-4 mt-4"><button type="button" onClick={prevStep} className="button-secondary">Back</button><button type="button" onClick={nextStep} className="button-primary">Next</button></div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Water Source</label><select value={farmerData.irrigationSource} onChange={e => handleInputChange('irrigationSource', e.target.value)} className="input"><option>Borewell</option><option>Canal</option><option>Rain-fed</option><option>Other</option></select></div>
                        <div><label className="label">Availability</label><select value={farmerData.waterAvailability} onChange={e => handleInputChange('waterAvailability', e.target.value)} className="input"><option>Abundant</option><option>Moderate</option><option>Scarce</option></select></div>
                    </div>
                    <div className="pt-2"><label className="label mb-2">Bank Account?</label><div className="flex gap-4"><input type="radio" id="bankYes" name="bankAccount" value="Yes" checked={farmerData.bankAccount === 'Yes'} onChange={e => handleInputChange('bankAccount', e.target.value)}/><label htmlFor="bankYes" className="radio-label">Yes</label><input type="radio" id="bankNo" name="bankAccount" value="No" checked={farmerData.bankAccount === 'No'} onChange={e => handleInputChange('bankAccount', e.target.value)}/><label htmlFor="bankNo" className="radio-label">No</label></div></div>
                    <div className="pt-2"><label className="label mb-2">Aadhaar Linked?</label><div className="flex gap-4"><input type="radio" id="aadhaarYes" name="aadhaar" value="Yes" checked={farmerData.aadhaarLinked === 'Yes'} onChange={e => handleInputChange('aadhaarLinked', e.target.value)}/><label htmlFor="aadhaarYes" className="radio-label">Yes</label><input type="radio" id="aadhaarNo" name="aadhaar" value="No" checked={farmerData.aadhaarLinked === 'No'} onChange={e => handleInputChange('aadhaarLinked', e.target.value)}/><label htmlFor="aadhaarNo" className="radio-label">No</label></div></div>
                    <div className="flex gap-4 mt-4"><button type="button" onClick={prevStep} className="button-secondary">Back</button><button type="submit" disabled={loading} className="button-primary">{loading ? 'Saving...' : 'Complete Profile'}</button></div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthWindow;