import { MoreVertical } from 'lucide-react';

interface CareerNodeProps {
  title: string;
  level: string;
  matchPercentage: number;
  skillsMatch?: { current: number; required: number };
  isSelected?: boolean;
  onClick?: () => void;
  onShowDetails?: () => void;
}

const getMatchColorClass = (percentage: number) => {
  if (percentage >= 70) return 'bg-match-good text-white';
  if (percentage >= 50) return 'bg-primary text-white';
  return 'bg-match-low text-white';
};

const getConnectionDotColor = (percentage: number) => {
  if (percentage >= 70) return 'bg-match-good';
  if (percentage >= 50) return 'bg-primary';
  return 'bg-match-low';
};

const CareerNode = ({ 
  title, 
  level, 
  matchPercentage, 
  skillsMatch, 
  isSelected = false,
  onClick,
  onShowDetails
}: CareerNodeProps) => {
  return (
    <div 
      className={`relative flex items-center gap-2 cursor-pointer transition-all duration-200 hover:scale-105 ${isSelected ? 'z-30' : ''}`}
      onClick={onClick}
    >
      {/* Connection dot on the left - this is where the line connects */}
      <div className={`w-2.5 h-2.5 rounded-full ${getConnectionDotColor(matchPercentage)} shadow-sm flex-shrink-0`} />
      
      {/* Card - Smaller fixed size for consistency */}
      <div className="bg-white rounded-lg shadow-md border border-border p-2.5 w-[140px] h-[60px] flex flex-col">
        <div className="flex items-start justify-between mb-auto">
          <div className="flex-1 pr-1">
            <h3 className="font-medium text-foreground text-xs leading-tight line-clamp-2">{title}</h3>
            <p className="text-muted-foreground text-[10px] mt-0.5">{level}</p>
          </div>
          
          <button className="p-0.5 hover:bg-muted rounded flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <MoreVertical className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
        
        {isSelected && (
          <div className="mt-auto">
            {skillsMatch && (
              <p className="text-[10px] text-muted-foreground line-clamp-1 mb-1">
                <span className="text-primary font-medium">{skillsMatch.current}</span> of{' '}
                <span className="font-medium">{skillsMatch.required}</span> skills
              </p>
            )}
            
            <button 
              className="px-2 py-1 text-[10px] bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity font-medium w-full"
              onClick={(e) => {
                e.stopPropagation();
                onShowDetails?.();
              }}
            >
              Show Details
            </button>
          </div>
        )}
      </div>
      
      {/* Match percentage badge on the right - smaller */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md flex-shrink-0 ${getMatchColorClass(matchPercentage)}`}>
        {matchPercentage}%
      </div>
    </div>
  );
};

export default CareerNode;
