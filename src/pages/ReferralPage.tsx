// src/pages/ReferralPage.tsx

import React, { useState } from 'react';
import { Users, Gift, Copy } from 'lucide-react';

const ReferralPage: React.FC = () => {
    const [referralCode] = useState('FARM123XYZ');
    const [copied, setCopied] = useState(false);
    const handleCopyCode = () => { navigator.clipboard.writeText(referralCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    const progress = { completed: 3, target: 5, percentage: (3 / 5) * 100 };
    const rewards = [ { referrals: 1, reward: '₹100 cash bonus', unlocked: true }, { referrals: 3, reward: 'Free soil testing kit', unlocked: true }, { referrals: 5, reward: '₹500 shopping voucher', unlocked: false }, { referrals: 10, reward: 'Premium subscription (6 months)', unlocked: false } ];

    return (
        <div className="space-y-6 pb-20 lg:pb-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-green-100 dark:border-gray-700 p-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-3"><Users className="w-8 h-8 text-green-600" />Invite & Earn Program</h1>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 mb-8 text-center">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Your Referral Code</h2>
                    <div className="bg-white dark:bg-gray-900/50 rounded-lg border-2 border-green-200 dark:border-gray-600 p-4 mb-4">
                        <div className="flex items-center justify-center gap-4">
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400 tracking-wider">{referralCode}</span>
                            <button onClick={handleCopyCode} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"><Copy className="w-4 h-4" />{copied ? 'Copied!' : 'Copy'}</button>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Share this code with fellow farmers to earn rewards!</p>
                </div>
                
                <div className="bg-blue-50 dark:bg-gray-700/50 rounded-xl p-6 mb-8 border border-blue-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2"><Gift className="w-5 h-5 text-blue-600 dark:text-blue-400" />Referral Progress</h2>
                    <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2"><span>Successful Referrals</span><span>{progress.completed} / {progress.target}</span></div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3"><div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full" style={{ width: `${progress.percentage}%` }}></div></div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">You're {progress.target - progress.completed} referrals away from your next reward!</p>
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Reward Tiers</h2>
                    <div className="space-y-4">
                        {rewards.map((reward, index) => (
                            <div key={index} className={`border rounded-xl p-4 transition-all ${reward.unlocked ? 'bg-green-50 dark:bg-gray-700/50 border-green-200 dark:border-gray-600' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${reward.unlocked ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}>{reward.unlocked ? <Gift className="w-6 h-6" /> : <span className="font-bold">{reward.referrals}</span>}</div>
                                        <div>
                                            <p className={`font-semibold ${reward.unlocked ? 'text-green-800 dark:text-green-300' : 'text-gray-600 dark:text-gray-300'}`}>{reward.referrals} Referral{reward.referrals > 1 ? 's' : ''}</p>
                                            <p className={`text-sm ${reward.unlocked ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>{reward.reward}</p>
                                        </div>
                                    </div>
                                    {reward.unlocked && (<span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">Unlocked</span>)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ReferralPage;