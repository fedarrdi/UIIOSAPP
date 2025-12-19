import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Lightbulb, TrendingUp } from 'lucide-react';

interface PaywallScreenProps {
    onContinue: () => void;
    onSkip: () => void;
}

export function PaywallScreen({ onContinue, onSkip }: PaywallScreenProps) {
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
    const [selectedPlan, setSelectedPlan] = useState<'premium' | 'premiumPlus' | 'pro'>('premiumPlus');

    const plans = [
        {
            id: 'premium' as const,
            trial: '1-week trial',
            name: 'Premium Monthly',
            billing: 'Monthly billing',
            price: '$19.99',
            originalPrice: null,
            badge: null,
            gradient: 'from-blue-500 to-blue-600'
        },
        {
            id: 'premiumPlus' as const,
            trial: '1-week trial',
            name: 'Premium+ Monthly',
            billing: 'Monthly billing',
            price: '$29.99',
            originalPrice: '$59.99',
            badge: 'Early Bird Discount',
            badgeColor: 'from-cyan-400 to-cyan-500',
            gradient: 'from-cyan-500 to-cyan-600'
        },
        {
            id: 'pro' as const,
            trial: '1-week trial',
            name: 'Pro Monthly',
            billing: 'Monthly billing',
            price: '$79.99',
            originalPrice: '$129.99',
            badge: null,
            gradient: 'from-purple-500 to-purple-600'
        }
    ];

    const benefits = [
        { icon: <TrendingUp className="w-5 h-5" />, text: 'Trending Insights', description: 'Uncover data-backed betting opportunities in a curated feed.' },
        { icon: <Lightbulb className="w-5 h-5" />, text: 'Thousands of Props & Games', description: 'All the props, teams and leagues refreshed each day.' }
    ];

    const selectedPlanData = plans.find(p => p.id === selectedPlan)!;

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#1a1a1a] rounded-3xl shadow-2xl overflow-hidden border border-[#2a2a2a]">
                {/* Header with Close Button */}
                <div className="relative p-6 pb-4">
                    <button
                        onClick={onSkip}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>

                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-white mb-3">
                            Choose your plan
                        </h1>
                    </div>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <button
                            onClick={() => setBillingPeriod('monthly')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                billingPeriod === 'monthly'
                                    ? 'bg-white text-gray-900'
                                    : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a]'
                            }`}
                        >
                            Monthly
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setBillingPeriod('yearly')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    billingPeriod === 'yearly'
                                        ? 'bg-white text-gray-900'
                                        : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a]'
                                }`}
                            >
                                Yearly
                            </button>
                        </div>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="px-6 space-y-3 mb-6">
                    {plans.map((plan, index) => (
                        <motion.button
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => setSelectedPlan(plan.id)}
                            className={`relative w-full bg-[#0f0f0f] rounded-2xl p-4 text-left transition-all ${
                                selectedPlan === plan.id
                                    ? 'ring-2 ring-white shadow-lg shadow-white/10'
                                    : 'ring-1 ring-[#2a2a2a] hover:ring-[#3a3a3a]'
                            }`}
                        >
                            {/* Selection Indicator */}
                            {selectedPlan === plan.id && (
                                <div className="absolute top-4 left-4 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                            )}

                            <div className="flex items-center justify-between pl-8">
                                <div>
                                    <div className="text-xs text-teal-400 font-semibold mb-1">{plan.trial}</div>
                                    <div className="text-base font-bold text-white">{plan.name}</div>
                                    <div className="text-xs text-gray-500">{plan.billing}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-white">{plan.price}</div>
                                    {plan.originalPrice && (
                                        <div className="text-sm text-gray-600 line-through">{plan.originalPrice}</div>
                                    )}
                                </div>
                            </div>

                            {plan.badge && (
                                <div className={`mt-2 inline-block bg-gradient-to-r ${plan.badgeColor} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                                    {plan.badge}
                                </div>
                            )}
                        </motion.button>
                    ))}
                </div>

                {/* What do I get? Section */}
                <div className="px-6 mb-6">
                    <h2 className="text-lg font-bold text-white mb-4">What do I get?</h2>
                    <div className="space-y-3">
                        {benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-[#2a2a2a] rounded-full flex items-center justify-center text-gray-400">
                                    {benefit.icon}
                                </div>
                                <div>
                                    <div className="font-semibold text-white text-sm">{benefit.text}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">{benefit.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Continue Button */}
                <div className="px-6 pb-6">
                    <button
                        onClick={onContinue}
                        className="w-full py-4 bg-white text-gray-900 rounded-2xl font-bold text-base hover:bg-gray-100 active:scale-[0.98] transition-all shadow-lg"
                    >
                        Continue
                    </button>
                    <button
                        onClick={onSkip}
                        className="w-full mt-3 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                    >
                        I HAVE A PROMO CODE
                    </button>
                </div>
            </div>
        </div>
    );
}
