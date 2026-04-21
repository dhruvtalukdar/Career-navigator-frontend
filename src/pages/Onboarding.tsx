import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import NetworkBackground from '@/components/layout/NetworkBackground';
import ProgressBar from '@/components/layout/ProgressBar';
import StepWelcome from '@/components/onboarding/StepWelcome';
import StepLinkedIn from '@/components/onboarding/StepLinkedIn';
import StepCV from '@/components/onboarding/StepCV';

const stepLabels = [
  'Two more steps to change your future!',
  'One step away!',
  "You're almost done!",
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleGenerate = () => {
    navigate('/profile-review');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <NetworkBackground />
      
      <main className="flex-1 flex flex-col items-center justify-center pt-20 pb-16 relative z-10">
        <ProgressBar
          currentStep={currentStep}
          totalSteps={3}
          label={stepLabels[currentStep - 1]}
        />
        
        {currentStep === 1 && <StepWelcome onNext={handleNext} />}
        {currentStep === 2 && <StepLinkedIn onNext={handleNext} onSkip={handleSkip} />}
        {currentStep === 3 && <StepCV onGenerate={handleGenerate} onSkip={handleGenerate} />}
      </main>
      
      <Footer />
    </div>
  );
};

export default Onboarding;
