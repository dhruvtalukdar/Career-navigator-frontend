import { useState } from 'react';
import { User, Settings, Compass, Lock, Info, Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface StepWelcomeProps {
  onNext: () => void;
}

const StepWelcome = ({ onNext }: StepWelcomeProps) => {
  const [agreed, setAgreed] = useState(false);

  const steps = [
    { icon: User, label: 'Step 1', text: 'Share your Profile' },
    { icon: Settings, label: 'Step 2', text: 'Tool evaluates path options' },
    { icon: Compass, label: 'Step 3', text: 'Discover your Potential Career Paths' },
  ];

  return (
    <div className="step-card text-center">
      <h1 className="text-3xl font-semibold text-foreground mb-2">Career Navigator</h1>
      <p className="text-muted-foreground mb-8">Your next chapter starts here.</p>

      <div className="relative flex flex-col items-center gap-4 mb-10">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 px-5 py-3 rounded-full bg-primary text-primary-foreground 
                       ${index === 0 ? '' : index === 1 ? 'ml-20' : 'mr-10'}`}
          >
            <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <step.icon className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs opacity-80">{step.label}</p>
              <p className="text-sm font-medium">{step.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-left mb-6">
        <h2 className="text-lg font-medium text-foreground mb-4">Before we begin</h2>
        
        <div className="space-y-4">
          <div className="flex gap-3">
            <Lock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm text-foreground">Data Confidentiality:</p>
              <p className="text-sm text-muted-foreground">
                We will only use your profile information to power this tool and help you discover career paths.{' '}
                <span className="font-medium text-foreground">Your data stays here and is not shared.</span>
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm text-foreground">This is a Guide, Not a Guarantee:</p>
              <p className="text-sm text-muted-foreground">
                This tool is designed to help you visualize possibilities and plan your growth.{' '}
                <span className="font-medium text-foreground">It does not guarantee any specific job or promotion.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Checkbox
          id="agree"
          checked={agreed}
          onCheckedChange={(checked) => setAgreed(checked as boolean)}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <label htmlFor="agree" className="text-sm text-foreground cursor-pointer">
          I have read and agree to the conditions outlined above.
        </label>
      </div>

      <button
        onClick={onNext}
        disabled={!agreed}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

export default StepWelcome;
