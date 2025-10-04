// src/pages/SchemesPage.tsx

import React from 'react';
import { Gift, CreditCard, FileText, Award, ExternalLink } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const SchemesPage: React.FC = () => {
    const schemes = [
        { name: 'PM-Kisan', fullName: 'Pradhan Mantri Kisan Samman Nidhi', benefit: '₹6,000 annual income support', description: 'Direct cash transfer to farmer families in three equal installments', icon: Gift, color: 'green', status: 'applied', eligibility: 'Small & marginal farmers with cultivable land up to 2 hectares', documents: ['Aadhaar Card', 'Bank Account Details', 'Land Records'], applicationProcess: 'Online through PM-Kisan portal or CSC centers', beneficiaries: '11+ crore farmers', installments: [ { period: 'April-July', amount: '₹2,000', status: 'Paid' }, { period: 'August-November', amount: '₹2,000', status: 'Paid' }, { period: 'December-March', amount: '₹2,000', status: 'Pending' } ], applyLink: 'https://pmkisan.gov.in/' },
        { name: 'Soil Health Card', fullName: 'Soil Health Management Scheme', benefit: 'Free soil testing & fertilizer advice', description: 'Laboratory analysis of soil nutrients and customized fertilizer recommendations', icon: FileText, color: 'blue', status: 'available', eligibility: 'All farmers with agricultural land', documents: ['Land Records', 'Aadhaar Card', 'Mobile Number'], applicationProcess: 'Through Agriculture Department or online portal', beneficiaries: '22+ crore farmers covered', services: [ { service: 'Soil Testing', description: 'NPK, pH, Organic Carbon analysis' }, { service: 'Fertilizer Recommendation', description: 'Crop-specific nutrient advice' }, { service: 'Digital Card', description: 'QR code enabled soil health card' } ], applyLink: 'https://soilhealth.dac.gov.in/' },
        { name: 'Kisan Credit Card', fullName: 'Agricultural Credit Scheme', benefit: 'Low-interest loans for farmers', description: 'Easy access to credit for agricultural expenses at subsidized interest rates', icon: CreditCard, color: 'purple', status: 'available', eligibility: 'Farmers, tenant farmers, oral lessees, sharecroppers', documents: ['Identity Proof', 'Address Proof', 'Land Documents', 'Income Proof'], applicationProcess: 'Through banks, cooperative societies, RRBs', beneficiaries: '7+ crore farmers', features: [ { feature: 'Credit Limit', details: 'Up to ₹3 lakh without collateral' }, { feature: 'Interest Rate', details: '7% per annum (with 3% subvention)' }, { feature: 'Repayment', details: 'Flexible repayment based on crop cycle' }, { feature: 'Additional Benefits', details: 'Personal accident insurance of ₹50,000' } ], applyLink: 'https://pmkisan.gov.in/Documents/Kisan_Credit_Card.pdf' }
    ];
    const adoptionData = [ { name: 'PM-Kisan', value: 60, color: '#059669' }, { name: 'Soil Health Card', value: 25, color: '#0ea5e9' }, { name: 'Kisan Credit Card', value: 15, color: '#8b5cf6' } ];
    const getColorClasses = (color: string) => {
        switch (color) {
            case 'green': return { bg: 'bg-green-50 dark:bg-gray-800', border: 'border-green-200 dark:border-gray-700', icon: 'text-green-600 dark:text-green-400', button: 'bg-green-600 hover:bg-green-700' };
            case 'blue': return { bg: 'bg-blue-50 dark:bg-gray-800', border: 'border-blue-200 dark:border-gray-700', icon: 'text-blue-600 dark:text-blue-400', button: 'bg-blue-600 hover:bg-blue-700' };
            case 'purple': return { bg: 'bg-purple-50 dark:bg-gray-800', border: 'border-purple-200 dark:border-gray-700', icon: 'text-purple-600 dark:text-purple-400', button: 'bg-purple-600 hover:bg-purple-700' };
            default: return { bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700', icon: 'text-gray-600 dark:text-gray-400', button: 'bg-gray-600 hover:bg-gray-700' };
        }
    };
    const appliedSchemes = schemes.filter(s => s.status === 'applied');
    const availableSchemes = schemes.filter(s => s.status === 'available');

    return (
        <div className="space-y-6 pb-20 lg:pb-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-green-100 dark:border-gray-700 p-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-3"><Award className="w-8 h-8 text-green-600" />Farmer Support Schemes</h1>
                
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">✅ Schemes You've Applied For</h2>
                <div className="space-y-6 mb-10">
                    {appliedSchemes.map((scheme, index) => {
                        const Icon = scheme.icon; const colors = getColorClasses(scheme.color);
                        const nextPending = scheme.installments?.find(inst => inst.status === 'Pending') || null;
                        return (
                            <div key={index} className={`${colors.bg} ${colors.border} border rounded-xl p-6`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center border dark:border-gray-600`}><Icon className={`w-6 h-6 ${colors.icon}`} /></div>
                                    <div><h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{scheme.name}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{scheme.fullName}</p></div>
                                </div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{scheme.benefit}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{scheme.description}</p>
                                {nextPending && (<div className="mt-4 bg-white dark:bg-gray-700 p-3 rounded border dark:border-gray-600"><p className="text-sm font-medium text-gray-800 dark:text-gray-200">Next Payment:</p><div className="flex justify-between mt-1"><span className="text-gray-700 dark:text-gray-300">{nextPending.period}</span><span className="text-yellow-700 bg-yellow-100 px-2 py-1 rounded text-xs">{nextPending.amount} Pending</span></div></div>)}
                                <a href={scheme.applyLink} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 mt-4 ${colors.button} text-white py-2 px-4 rounded-lg font-medium`}>Go to Payment <ExternalLink className="w-4 h-4" /></a>
                            </div>
                        );
                    })}
                </div>

                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">🆕 Schemes You Can Apply For</h2>
                <div className="space-y-6 mb-10">
                    {availableSchemes.map((scheme, index) => {
                        const Icon = scheme.icon; const colors = getColorClasses(scheme.color);
                        return (
                            <div key={index} className={`${colors.bg} ${colors.border} border rounded-xl p-6`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center border dark:border-gray-600`}><Icon className={`w-6 h-6 ${colors.icon}`} /></div>
                                    <div><h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{scheme.name}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{scheme.fullName}</p></div>
                                </div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{scheme.benefit}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{scheme.description}</p>
                                <div className="mt-4 text-sm text-gray-700 dark:text-gray-300 space-y-2">
                                    <p><strong>Eligibility:</strong> {scheme.eligibility}</p>
                                    <p><strong>Documents:</strong> {scheme.documents.join(', ')}</p>
                                </div>
                                <a href={scheme.applyLink} target="_blank" rel="noopener noreferrer" className={`inline-block mt-4 ${colors.button} text-white py-2 px-4 rounded-lg font-medium`}>Learn More & Apply</a>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
export default SchemesPage;