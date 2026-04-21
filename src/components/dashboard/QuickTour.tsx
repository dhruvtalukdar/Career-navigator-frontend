import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface QuickTourProps {
  onComplete: () => void;
}

const tourSteps = [
  {
    title: "Welcome to Career Navigator",
    description: "This tool helps you explore potential career paths based on your skills and experience.",
  },
  {
    title: "Your Current Role",
    description: "Your profile is at the center. From here, you can see different career directions you can take.",
  },
  {
    title: "Upward Movement",
    description: "These are roles that represent a promotion or advancement in your current career track.",
  },
  {
    title: "Lateral Movement",
    description: "These are roles at a similar level but in different areas that match your skills.",
  },
  {
    title: "Match Percentage",
    description: "Each role shows how well your current skills match the requirements. Green is a good match!",
  },
  {
    title: "More questions?",
    description: "If you have any more doubts related to Career Navigator, you can always talk to the smart virtual assistant. It's pretty smart.",
  },
];

const QuickTour = ({ onComplete }: QuickTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 w-80 bg-white rounded-lg shadow-xl border border-border z-50">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Quick Tour</span>
          <button 
            onClick={onComplete}
            className="p-1 hover:bg-muted rounded"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        
        <h3 className="font-semibold text-foreground mb-2">
          {tourSteps[currentStep].title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {tourSteps[currentStep].description}
        </p>
        
        {/* Progress dots */}
        <div className="flex justify-center gap-1 mb-4">
          {tourSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          <button
            onClick={handleNext}
            className="px-4 py-1.5 bg-primary text-primary-foreground text-sm rounded hover:opacity-90"
          >
            {currentStep === tourSteps.length - 1 ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickTour;
