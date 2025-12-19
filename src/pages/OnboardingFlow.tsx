import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { PhoneMockup } from '../components/PhoneMockup';

interface OnboardingFlowProps {
    onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedMind, setSelectedMind] = useState<string | null>(null);
    const [selectedAge, setSelectedAge] = useState<string | null>(null);
    const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

    const screens = [
        {
            question: "What's on your mind?",
            subtitle: "Your answers will help shape the app around your needs.",
            options: [
                'Elevate mood',
                'Reduce stress & anxiety',
                'Improve sleep',
                'Increase productivity'
            ]
        },
        {
            question: "How old are you?",
            subtitle: "Your answers will help shape the app around your needs.",
            options: [
                'Under 18',
                '18-24',
                '25-34',
                '35-44'
            ]
        },
        {
            question: "What's your main goal?",
            subtitle: "Your answers will help shape the app around your needs.",
            options: [
                'Build better habits',
                'Track my progress',
                'Stay consistent',
                'Achieve goals faster'
            ]
        }
    ];

    const getSelected = () => {
        switch (currentStep) {
            case 0: return selectedMind;
            case 1: return selectedAge;
            case 2: return selectedGoal;
            default: return null;
        }
    };

    const setSelected = (value: string) => {
        switch (currentStep) {
            case 0: setSelectedMind(value); break;
            case 1: setSelectedAge(value); break;
            case 2: setSelectedGoal(value); break;
        }
    };

    const nextStep = () => {
        if (currentStep < 2) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const currentScreen = screens[currentStep];
    const selected = getSelected();

    return (
        <PhoneMockup>
            <div className="h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        className="w-full px-4"
                    >
                        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl overflow-hidden shadow-2xl">
                            {/* Header */}
                            <div className="relative p-6 pb-4 border-b border-[#2a2a2a]">
                                {currentStep > 0 && (
                                    <button
                                        onClick={prevStep}
                                        className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#2a2a2a] transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-gray-400" />
                                    </button>
                                )}
                                <button
                                    onClick={onComplete}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    Skip
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-8">
                                <h1 className="text-2xl font-bold text-white mb-2 text-center">
                                    {currentScreen.question}
                                </h1>
                                <p className="text-sm text-gray-400 mb-8 text-center">
                                    {currentScreen.subtitle}
                                </p>

                                {/* Options */}
                                <div className="space-y-3 mb-8">
                                    {currentScreen.options.map((option, index) => (
                                        <motion.button
                                            key={option}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => setSelected(option)}
                                            className={`w-full py-4 px-6 rounded-2xl font-medium text-base transition-all ${
                                                selected === option
                                                    ? 'bg-white text-gray-900'
                                                    : 'bg-[#0f0f0f] text-white hover:bg-[#1a1a1a] border border-[#2a2a2a]'
                                            }`}
                                        >
                                            {option}
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Footer Note */}
                                <p className="text-xs text-gray-500 mb-6 text-center">
                                    Your selections won't limit access to any features.
                                </p>

                                {/* Continue Button */}
                                <button
                                    onClick={nextStep}
                                    disabled={!selected}
                                    className="w-full py-4 bg-white text-gray-900 rounded-2xl font-bold text-base hover:bg-gray-100 active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Progress Indicators */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                    {[0, 1, 2].map((step) => (
                        <div
                            key={step}
                            className={`h-1 rounded-full transition-all ${
                                step === currentStep
                                    ? 'w-8 bg-white'
                                    : step < currentStep
                                    ? 'w-8 bg-gray-600'
                                    : 'w-8 bg-gray-800'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </PhoneMockup>
    );
}
