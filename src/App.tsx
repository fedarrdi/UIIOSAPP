import React, { useState, useEffect } from 'react';
import { CounterPage } from './pages/CounterPage';
import { OnboardingFlow } from './pages/OnboardingFlow';
import { PaywallScreen } from './pages/PaywallScreen';
import { SignUpScreen } from './pages/SignUpScreen';
import { SplashScreen } from './pages/SplashScreen';

type AppScreen = 'splash' | 'onboarding' | 'paywall' | 'signup' | 'app';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash');

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('onboarding-completed');
    if (hasCompletedOnboarding === 'true') {
      setCurrentScreen('app');
    }
  }, []);

  const handleSplashComplete = () => {
    setCurrentScreen('onboarding');
  };

  const handleOnboardingComplete = () => {
    setCurrentScreen('paywall');
  };

  const handlePaywallContinue = () => {
    setCurrentScreen('signup');
  };

  const handlePaywallSkip = () => {
    setCurrentScreen('signup');
  };

  const handleSignUpComplete = () => {
    localStorage.setItem('onboarding-completed', 'true');
    setCurrentScreen('app');
  };

  // For testing: add URL parameter to view specific screen
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const screen = params.get('screen');
    if (screen === 'splash' || screen === 'onboarding' || screen === 'paywall' || screen === 'signup' || screen === 'app') {
      setCurrentScreen(screen);
    }
  }, []);

  if (currentScreen === 'splash') {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (currentScreen === 'onboarding') {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (currentScreen === 'paywall') {
    return <PaywallScreen onContinue={handlePaywallContinue} onSkip={handlePaywallSkip} />;
  }

  if (currentScreen === 'signup') {
    return <SignUpScreen onComplete={handleSignUpComplete} />;
  }

  return <CounterPage />;
}