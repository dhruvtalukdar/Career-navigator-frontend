import { useState } from 'react';
import { User, CheckCircle, Linkedin } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface StepLinkedInProps {
  onNext: () => void;
  onSkip: () => void;
}

const StepLinkedIn = ({ onNext, onSkip }: StepLinkedInProps) => {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [agreed, setAgreed] = useState(false);

  const isValidUrl = linkedinUrl.includes('linkedin.com/');

  return (
    <div className="step-card text-center">
      <h1 className="text-3xl font-semibold text-foreground mb-2">Career Navigator</h1>
      <p className="text-muted-foreground mb-8">Let's collect your skills!</p>

      <div className="flex justify-center items-center mb-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center">
            <User className="w-12 h-12 text-primary-foreground" />
          </div>
          <div className="absolute -right-4 bottom-0 w-14 h-14 rounded-lg bg-[#0077B5] flex items-center justify-center shadow-lg">
            <Linkedin className="w-8 h-8 text-white" fill="white" />
          </div>
        </div>
      </div>

      <h2 className="text-lg font-medium text-foreground mb-4">Linkedin</h2>

      <div className="relative mb-4">
        <Input
          type="text"
          placeholder="www.linkedin.com/john-doe-1734/"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          className="pr-10"
        />
        {isValidUrl && (
          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
        )}
      </div>

      <div className="flex items-center gap-3 mb-8">
        <Checkbox
          id="agree-linkedin"
          checked={agreed}
          onCheckedChange={(checked) => setAgreed(checked as boolean)}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <label htmlFor="agree-linkedin" className="text-sm text-foreground cursor-pointer text-left">
          I agree to let Career Navigator analyze my profile to generate career paths.
        </label>
      </div>

      <div className="flex justify-center gap-4">
        <button onClick={onSkip} className="btn-secondary">
          Skip
        </button>
        <button
          onClick={onNext}
          disabled={!isValidUrl || !agreed}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StepLinkedIn;
