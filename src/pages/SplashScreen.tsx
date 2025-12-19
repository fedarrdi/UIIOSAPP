import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { PhoneMockup } from '../components/PhoneMockup';

interface SplashScreenProps {
    onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
    useEffect(() => {
        // Auto-transition after 2.5 seconds
        const timer = setTimeout(() => {
            onComplete();
        }, 2500);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <PhoneMockup>
            <div className="h-screen bg-[#1a1a1a] flex items-center justify-center overflow-hidden relative">
                {/* Status Bar Mockup */}
                <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-6 text-white/60 text-xs">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        </svg>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>

                {/* Logo Animation */}
                <div className="flex flex-col items-center">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="relative"
                    >
                        {/* Flow Logo */}
                        <div className="flex flex-col items-center">
                            {/* Infinity Symbol / Flow Icon */}
                            <motion.div
                                initial={{ rotate: 0 }}
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="mb-6"
                            >
                                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M20 40C20 31.7157 26.7157 25 35 25C43.2843 25 50 31.7157 50 40C50 31.7157 56.7157 25 65 25C73.2843 25 80 31.7157 80 40C80 48.2843 73.2843 55 65 55C56.7157 55 50 48.2843 50 40C50 48.2843 43.2843 55 35 55C26.7157 55 20 48.2843 20 40Z"
                                        fill="url(#gradient)"
                                        className="drop-shadow-2xl"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="20" y1="25" x2="80" y2="55" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#60A5FA" />
                                            <stop offset="0.5" stopColor="#A78BFA" />
                                            <stop offset="1" stopColor="#F472B6" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </motion.div>

                            {/* Flow Text */}
                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="text-6xl font-bold text-white tracking-wider"
                                style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.05em' }}
                            >
                                FLOW
                            </motion.h1>
                        </div>
                    </motion.div>

                    {/* Loading Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className="mt-16"
                    >
                        <div className="flex gap-1.5">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="w-2 h-2 rounded-full bg-white/40"
                                    animate={{
                                        scale: [1, 1.3, 1],
                                        opacity: [0.4, 1, 0.4]
                                    }}
                                    transition={{
                                        duration: 1.2,
                                        repeat: Infinity,
                                        delay: i * 0.2
                                    }}
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Bottom fade effect */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1a1a1a] to-transparent" />
            </div>
        </PhoneMockup>
    );
}
