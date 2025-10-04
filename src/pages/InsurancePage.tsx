// src/pages/InsurancePage.tsx

import React, { useState } from 'react';
import { Shield, Upload, FileText, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const InsurancePage: React.FC = () => {
    const [selectedCrop, setSelectedCrop] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [eligibleSchemes, setEligibleSchemes] = useState<string[]>([]);
    const [selectedScheme, setSelectedScheme] = useState('');
    const [sumInsured, setSumInsured] = useState<number>(0);
    const [season, setSeason] = useState<'kharif' | 'rabi' | 'commercial'>('kharif');
    const [calculatedPremium, setCalculatedPremium] = useState<number | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    const insuranceSchemes = [
        { scheme: 'PMFBY', fullName: 'Pradhan Mantri Fasal Bima Yojana', coverage: '₹50,000/acre', premiumRate: 0.02, subsidyRate: { kharif: 0.75, rabi: 0.7, commercial: 0.5 }, features: ['Weather-based coverage', 'Quick claim settlement', 'Subsidized premium'], eligibility: 'All farmers (landowner/tenant)', crops: 'Wheat, Rice, Cotton, Maize, Sugarcane', claimProcess: '72 hours notification, Survey within 48 hours', applyUrl: 'https://pmfby.gov.in/' },
        { scheme: 'State Crop Insurance', fullName: 'State Government Crop Insurance', coverage: '₹30,000/acre', premiumRate: 0.015, subsidyRate: { kharif: 0.7, rabi: 0.65, commercial: 0 }, features: ['Local crop focus', 'Fast processing', 'Regional expertise'], eligibility: 'Farmers in notified areas', crops: 'Wheat, Rice, Cotton', claimProcess: 'Village-level assessment', applyUrl: 'https://www.maharashtra.gov.in/' },
        { scheme: 'Private AgriCare', fullName: 'Private Agricultural Insurance', coverage: '₹75,000/acre', premiumRate: 0.03, subsidyRate: { kharif: 0, rabi: 0, commercial: 0 }, features: ['Comprehensive coverage', '24/7 support', 'Additional benefits'], eligibility: 'All categories of farmers', crops: 'All crops including exotic varieties', claimProcess: 'Digital claim processing', applyUrl: 'https://www.icicilombard.com/rural-insurance/crop-insurance' }
    ];
    const coverageData = [ { name: 'PMFBY', value: 55, color: '#059669' }, { name: 'State Insurance', value: 25, color: '#0ea5e9' }, { name: 'Private AgriCare', value: 20, color: '#f59e0b' } ];

    const checkEligibility = () => {
        if (!selectedCrop || !selectedDistrict) { alert('Please select crop and district'); return; }
        const eligible = insuranceSchemes.filter(scheme => scheme.crops.toLowerCase().includes(selectedCrop.toLowerCase())).map(scheme => scheme.scheme);
        setEligibleSchemes(eligible);
    };

    return (
        <div className="space-y-6 pb-20 lg:pb-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-green-100 dark:border-gray-700 p-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-3"><Shield className="w-8 h-8 text-green-600" />Crop Insurance Advisory</h1>

                <div className="space-y-6 mb-8">
                    {insuranceSchemes.map((scheme, index) => (
                        <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-6 border border-green-100 dark:border-gray-700">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div>
                                    <div className="mb-4"><h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{scheme.scheme}</h3><p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{scheme.fullName}</p></div>
                                    <div className="space-y-3 mb-4"><div className="flex justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Coverage:</span><span className="font-semibold text-green-600 dark:text-green-400">{scheme.coverage}</span></div><div className="flex justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Premium:</span><span className="font-semibold text-gray-800 dark:text-gray-200">{(scheme.premiumRate * 100).toFixed(2)}%</span></div></div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Scheme Details</h4>
                                    <div className="space-y-2 text-sm"><div className="text-gray-600 dark:text-gray-400">Eligibility: <span className="text-gray-800 dark:text-gray-300">{scheme.eligibility}</span></div><div className="text-gray-600 dark:text-gray-400">Crops: <span className="text-gray-800 dark:text-gray-300">{scheme.crops}</span></div><div className="text-gray-600 dark:text-gray-400">Claim: <span className="text-gray-800 dark:text-gray-300">{scheme.claimProcess}</span></div></div>
                                </div>
                                <div>
                                    <ul className="space-y-1 mb-4">{scheme.features.map((feature, idx) => (<li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2"><div className="w-1 h-1 bg-green-400 rounded-full"></div>{feature}</li>))}</ul>
                                    <a href={scheme.applyUrl} target="_blank" rel="noopener noreferrer" className="w-full block text-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">Apply Now</a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default InsurancePage;