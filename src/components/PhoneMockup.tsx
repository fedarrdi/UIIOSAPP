import React from 'react';

interface PhoneMockupProps {
    children: React.ReactNode;
    className?: string;
}

export function PhoneMockup({ children, className = '' }: PhoneMockupProps) {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 md:p-8">
            <div
                className={`w-full max-w-md bg-[#0a0a0a] rounded-[2.5rem] shadow-2xl overflow-hidden ${className}`}
                style={{
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)'
                }}
            >
                {children}
            </div>
        </div>
    );
}
