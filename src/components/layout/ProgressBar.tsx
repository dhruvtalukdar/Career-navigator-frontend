interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  label?: string;
}

const ProgressBar = ({ currentStep, totalSteps, label }: ProgressBarProps) => {
  return (
    <div className="w-full max-w-md mx-auto mb-4">
      <div className="flex gap-2 mb-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`progress-segment flex-1 ${
              index < currentStep ? 'progress-active' : 'progress-inactive'
            }`}
          />
        ))}
      </div>
      {label && (
        <p className="text-center text-muted-foreground text-sm">{label}</p>
      )}
    </div>
  );
};

export default ProgressBar;
