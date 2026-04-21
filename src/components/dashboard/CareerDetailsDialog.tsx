import { TrendingUp, GraduationCap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface CareerDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  level: string;
  matchPercentage: number;
  explanation?: string;
  growthPath?: string;
  keySkills?: string[];
}

const CareerDetailsDialog = ({
  open,
  onOpenChange,
  title,
  level,
  matchPercentage,
  explanation,
  growthPath,
  keySkills,
}: CareerDetailsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground pr-8">
            {title}
          </DialogTitle>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="outline" className="text-sm">
              {level}
            </Badge>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Match Score:</span>
              <span className={`text-sm font-bold ${matchPercentage >= 70 ? 'text-match-good' : matchPercentage >= 50 ? 'text-primary' : 'text-match-low'}`}>
                {matchPercentage}%
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* AI Explanation - Why this role matches */}
          {explanation && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Why This Role Matches You</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {explanation}
              </p>
            </div>
          )}

          {/* Growth Path */}
          {growthPath && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Career Growth Path</h3>
              </div>
              <p className="text-sm text-muted-foreground">{growthPath}</p>
            </div>
          )}

          {/* Key Skills from API */}
          {keySkills && keySkills.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Key Skills Required</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {keySkills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-4 border-t">
            <button className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
              View Learning Resources
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CareerDetailsDialog;
