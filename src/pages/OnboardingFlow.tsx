import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, TrendingUp, Users, Sparkles, ArrowRight } from 'lucide-react';

interface OnboardingFlowProps {
    onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);

    const challenges = [
        'Maintaining consistency',
        'Staying motivated',
        'Tracking progress',
        'Building habits',
        'Achieving goals'
    ];

    const toggleChallenge = (challenge: string) => {
        setSelectedChallenges(prev =>
            prev.includes(challenge)
                ? prev.filter(c => c !== challenge)
                : [...prev, challenge]
        );
    };

    const nextStep = () => {
        if (currentStep < 2) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            <AnimatePresence mode="wait">
                {currentStep === 0 && (
                    <motion.div
                        key="step-0"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="w-full max-w-md"
                    >
                        {/* Problem Identification Screen */}
                        <div className="bg-[#141414] border border-[#2a2a2a] rounded-3xl p-8 shadow-2xl">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-900/20">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
                                    What challenges do you face?
                                </h1>
                                <p className="text-neutral-400 text-sm">
                                    Select all that apply to personalize your experience
                                </p>
                            </div>

                            <div className="space-y-3 mb-8">
                                {challenges.map((challenge, index) => (
                                    <motion.button
                                        key={challenge}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => toggleChallenge(challenge)}
                                        className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${selectedChallenges.includes(challenge)
                                                ? 'bg-emerald-500/10 border-emerald-500 text-white'
                                                : 'bg-[#1a1a1a] border-[#2a2a2a] text-neutral-400 hover:border-[#3a3a3a]'
                                            }`}
                                    >
                                        <span className="font-medium">{challenge}</span>
                                        {selectedChallenges.includes(challenge) && (
                                            <Check className="w-5 h-5 text-emerald-500" />
                                        )}
                                    </motion.button>
                                ))}
                            </div>

                            <button
                                onClick={nextStep}
                                disabled={selectedChallenges.length === 0}
                                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold text-base hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                Continue
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {currentStep === 1 && (
                    <motion.div
                        key="step-1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="w-full max-w-md"
                    >
                        {/* Social Proof Screen */}
                        <div className="bg-[#141414] border border-[#2a2a2a] rounded-3xl p-8 shadow-2xl text-center">
                            <div className="mb-8">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-900/20">
                                    <Users className="w-10 h-10 text-white" />
                                </div>
                                <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
                                    Join 10,000+ users
                                </h1>
                                <p className="text-neutral-400 text-base mb-8 leading-relaxed">
                                    Who have transformed their habits and achieved their goals
                                </p>
                            </div>

                            {/* Big Statistic */}
                            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-8 mb-8">
                                <div className="text-7xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">
                                    87%
                                </div>
                                <p className="text-white text-lg font-semibold mb-2">
                                    Success Rate
                                </p>
                                <p className="text-neutral-400 text-sm">
                                    of users achieve their goals within 90 days
                                </p>
                            </div>

                            {/* Additional Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
                                    <div className="text-2xl font-bold text-white mb-1">4.9</div>
                                    <div className="text-neutral-400 text-xs">App Rating</div>
                                </div>
                                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
                                    <div className="text-2xl font-bold text-white mb-1">2M+</div>
                                    <div className="text-neutral-400 text-xs">Interactions Tracked</div>
                                </div>
                            </div>

                            <button
                                onClick={nextStep}
                                className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl font-bold text-base hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                            >
                                Continue
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {currentStep === 2 && (
                    <motion.div
                        key="step-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="w-full max-w-md"
                    >
                        {/* Value Proposition Screen */}
                        <div className="bg-[#141414] border border-[#2a2a2a] rounded-3xl p-8 shadow-2xl">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-900/20">
                                    <TrendingUp className="w-10 h-10 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
                                    Everything you need to succeed
                                </h1>
                                <p className="text-neutral-400 text-sm">
                                    Powerful features to build lasting habits
                                </p>
                            </div>

                            <div className="space-y-4 mb-8">
                                {[
                                    { title: 'Track Progress', desc: 'Visualize your journey with beautiful charts' },
                                    { title: 'Build Streaks', desc: 'Stay motivated with daily streak tracking' },
                                    { title: 'Set Goals', desc: 'Define and achieve your personal targets' },
                                    { title: 'Track Notes', desc: 'Document your thoughts and reflections' },
                                    { title: 'View History', desc: 'Review your complete activity timeline' }
                                ].map((feature, index) => (
                                    <motion.div
                                        key={feature.title}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-start gap-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4"
                                    >
                                        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-purple-500/20">
                                            <Check className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold text-base mb-1">
                                                {feature.title}
                                            </h3>
                                            <p className="text-neutral-400 text-sm">
                                                {feature.desc}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <button
                                onClick={nextStep}
                                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-base hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2"
                            >
                                Get Started
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Progress Indicators */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {[0, 1, 2].map((step) => (
                    <div
                        key={step}
                        className={`h-1.5 rounded-full transition-all ${step === currentStep
                                ? 'w-8 bg-white'
                                : step < currentStep
                                    ? 'w-1.5 bg-white/50'
                                    : 'w-1.5 bg-white/20'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
