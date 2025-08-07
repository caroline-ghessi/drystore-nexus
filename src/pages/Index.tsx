import { useState, useEffect } from 'react';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { CorporateDashboard } from '@/components/corporate/CorporateDashboard';

export default function Index() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Verificar se é a primeira visita do usuário
    const hasSeenOnboarding = localStorage.getItem('drystore-onboarding-completed');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('drystore-onboarding-completed', 'true');
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('drystore-onboarding-completed', 'true');
    setShowOnboarding(false);
  };

  return (
    <div className="flex-1">
      {showOnboarding && (
        <OnboardingTour 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
      
      <CorporateDashboard />
    </div>
  );
}