import { useState, useRef } from 'react';
import { FileText, User, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { uploadResumeAndAnalyze } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface StepCVProps {
  onGenerate: () => void;
  onSkip: () => void;
}

const StepCV = ({ onGenerate, onSkip }: StepCVProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [includeLinkedIn, setIncludeLinkedIn] = useState(false);
  const [includeSCD, setIncludeSCD] = useState(false);
  const [includeMyLearning, setIncludeMyLearning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !agreed) return;

    setIsUploading(true);

    try {
      // Use the new complete analysis API
      const result = await uploadResumeAndAnalyze(file, {
        includeLinkedIn,
        includeSCD,
        includeMyLearning,
      });

      // Store the complete analysis result in sessionStorage for other pages
      sessionStorage.setItem('analysisResult', JSON.stringify(result));
      sessionStorage.setItem('profileId', result.profile_id);

      toast({
        title: "Success!",
        description: "Your resume has been analyzed successfully.",
      });

      // Navigate to profile review
      navigate('/profile-review');
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      toast({
        title: "Upload Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  return (
    <div className="step-card text-center">
      <h1 className="text-3xl font-semibold text-foreground mb-2">Career Navigator</h1>
      <p className="text-muted-foreground mb-8">Your next chapter starts here.</p>

      <div className="flex justify-center mb-6">
        <div className="w-20 h-24 rounded-lg bg-primary flex flex-col items-center justify-center">
          <FileText className="w-8 h-8 text-primary-foreground mb-1" />
          <User className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      <h2 className="text-lg font-medium text-foreground mb-4">CV</h2>

      <div
        className={`drag-zone mb-4 ${isDragging ? 'border-primary bg-primary/10' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {file ? (
          <div className="flex items-center justify-center gap-2 text-primary">
            <FileText className="w-5 h-5" />
            <span className="text-sm font-medium">{file.name}</span>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground text-sm mb-1">
              Drag and drop your CV here. Or Browse from your system folders.
            </p>
            <p className="text-muted-foreground text-xs mb-3">
              (PDFs, MS Word file, opentext. Max size: 2MB)
            </p>
            <button className="btn-secondary text-sm py-1.5 px-4">
              Browse
            </button>
          </>
        )}
      </div>

      <div className="flex items-center gap-3 mb-8">
        <Checkbox
          id="agree-cv"
          checked={agreed}
          onCheckedChange={(checked) => setAgreed(checked as boolean)}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <label htmlFor="agree-cv" className="text-sm text-foreground cursor-pointer text-left">
          I agree to let Career Navigator analyze my CV.
        </label>
      </div>

      {/* Additional Data Sources */}
      <div className="mb-6 p-4 border border-border rounded-lg bg-card">
        <h3 className="text-sm font-medium text-foreground mb-3">Additional Data Sources</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Enhance your career analysis by including additional data sources for more accurate recommendations.
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="linkedin-data"
              checked={includeLinkedIn}
              onCheckedChange={(checked) => setIncludeLinkedIn(checked as boolean)}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <label htmlFor="linkedin-data" className="text-sm text-foreground cursor-pointer">
              LinkedIn profile
            </label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="scd-data"
              checked={includeSCD}
              onCheckedChange={(checked) => setIncludeSCD(checked as boolean)}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <label htmlFor="scd-data" className="text-sm text-foreground cursor-pointer">
              SCD data
            </label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="mylearning-data"
              checked={includeMyLearning}
              onCheckedChange={(checked) => setIncludeMyLearning(checked as boolean)}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <label htmlFor="mylearning-data" className="text-sm text-foreground cursor-pointer">
              My Learning World
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button onClick={onSkip} className="btn-secondary" disabled={isUploading}>
          Skip
        </button>
        <button
          onClick={handleUpload}
          disabled={!agreed || !file || isUploading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Generate Career Path'
          )}
        </button>
      </div>
    </div>
  );
};

export default StepCV;
