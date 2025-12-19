import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Apple } from 'lucide-react';
import { PhoneMockup } from '../components/PhoneMockup';

interface SignUpScreenProps {
    onComplete: () => void;
}

export function SignUpScreen({ onComplete }: SignUpScreenProps) {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onComplete();
    };

    const handleSocialSignIn = (provider: string) => {
        // Mock social sign-in
        console.log(`Sign in with ${provider}`);
        onComplete();
    };

    return (
        <PhoneMockup>
            <div className="h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
                <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
            >
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl overflow-hidden shadow-2xl">
                    {/* Tab Header */}
                    <div className="flex border-b border-[#2a2a2a]">
                        <button
                            onClick={() => setMode('login')}
                            className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${
                                mode === 'login'
                                    ? 'text-white'
                                    : 'text-gray-500 hover:text-gray-400'
                            }`}
                        >
                            Log In
                            {mode === 'login' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                        <button
                            onClick={() => setMode('signup')}
                            className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${
                                mode === 'signup'
                                    ? 'text-white'
                                    : 'text-gray-500 hover:text-gray-400'
                            }`}
                        >
                            Sign Up
                            {mode === 'signup' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    </div>

                    <div className="p-8">

                        {/* Email/Password Form */}
                        <form onSubmit={handleSubmit} className="space-y-5 mb-6">
                            <div>
                                <label className="block text-gray-400 text-xs font-medium mb-2">
                                    Your Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-white transition-colors"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-gray-400 text-xs font-medium">
                                        Password
                                    </label>
                                    {mode === 'login' && (
                                        <button
                                            type="button"
                                            className="text-xs text-gray-400 hover:text-white transition-colors"
                                        >
                                            Forgot password?
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    minLength={8}
                                    className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-white transition-colors"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-white text-gray-900 rounded-xl font-bold text-base hover:bg-gray-100 active:scale-[0.98] transition-all shadow-lg"
                            >
                                Continue
                            </button>
                        </form>

                        {/* Social Sign-In Buttons */}
                        <div className="space-y-3 mb-6">
                            <button
                                onClick={() => handleSocialSignIn('Apple')}
                                className="w-full py-3.5 bg-[#0f0f0f] border border-[#2a2a2a] text-white rounded-xl font-medium text-sm hover:bg-[#1a1a1a] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                                </svg>
                                Login with Apple
                            </button>

                            <button
                                onClick={() => handleSocialSignIn('Google')}
                                className="w-full py-3.5 bg-[#0f0f0f] border border-[#2a2a2a] text-white rounded-xl font-medium text-sm hover:bg-[#1a1a1a] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Login with Google
                            </button>
                        </div>

                        {/* Bottom Link */}
                        <p className="text-center text-gray-400 text-sm">
                            {mode === 'login' ? (
                                <>
                                    Don't have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => setMode('signup')}
                                        className="text-white font-semibold hover:underline transition-colors"
                                    >
                                        Sign up
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => setMode('login')}
                                        className="text-white font-semibold hover:underline transition-colors"
                                    >
                                        Log in
                                    </button>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </motion.div>
            </div>
        </PhoneMockup>
    );
}

