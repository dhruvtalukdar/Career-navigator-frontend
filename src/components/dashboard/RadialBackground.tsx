import { useState, useEffect } from 'react';

interface RadialBackgroundProps {
  showRadarScan?: boolean;
  onScanComplete?: () => void;
  showGrid?: boolean;
}

const RadialBackground = ({ showRadarScan = false, onScanComplete, showGrid = false }: RadialBackgroundProps) => {
  const [scanComplete, setScanComplete] = useState(false);

  useEffect(() => {
    if (showRadarScan && !scanComplete) {
      const timer = setTimeout(() => {
        setScanComplete(true);
        onScanComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showRadarScan, scanComplete, onScanComplete]);

    // Generate radial lines from center
  const radialLines = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 * Math.PI) / 180;
    const x2 = 500 + Math.sin(angle) * 450;
    const y2 = 500 - Math.cos(angle) * 450;
    return { x1: 500, y1: 500, x2, y2 };
  });

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Radial gradient background - matching the reference image */}
      {/* <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, 
              hsl(174 30% 88%) 0%, 
              hsl(174 25% 82%) 25%, 
              hsl(174 20% 78%) 45%, 
              hsl(40 15% 88%) 70%,
              hsl(35 15% 90%) 100%
            )
          `,
        }}
      /> */}
      
      {/* Radar scan animation SVG */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Radar sweep gradient */}
          <linearGradient id="radarSweep" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(174 100% 31%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(174 100% 31%)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(174 100% 31%)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Static concentric circles - subtle and matching reference
        <circle cx="500" cy="500" r="420" fill="none" stroke="hsl(174 20% 75%)" strokeWidth="1" opacity="0.4" />
        <circle cx="500" cy="500" r="320" fill="none" stroke="hsl(174 20% 75%)" strokeWidth="1" opacity="0.35" />
        <circle cx="500" cy="500" r="220" fill="none" stroke="hsl(174 20% 75%)" strokeWidth="1" opacity="0.3" />
        <circle cx="500" cy="500" r="120" fill="none" stroke="hsl(174 20% 75%)" strokeWidth="1" opacity="0.25" />
        
        {/* Cross lines - very subtle */}
        {/* <line x1="500" y1="80" x2="500" y2="920" stroke="hsl(174 20% 75%)" strokeWidth="1" opacity="0.25" />
        <line x1="80" y1="500" x2="920" y2="500" stroke="hsl(174 20% 75%)" strokeWidth="1" opacity="0.25" />
        <line x1="160" y1="160" x2="840" y2="840" stroke="hsl(174 20% 75%)" strokeWidth="1" opacity="0.15" />
        <line x1="840" y1="160" x2="160" y2="840" stroke="hsl(174 20% 75%)" strokeWidth="1" opacity="0.15" />  */}

        {/* Radar pulse waves - only show during scan */}
        {showRadarScan && !scanComplete && (
          <>
            {/* Pulsing wave circles */}
            <circle 
              cx="500" 
              cy="500" 
              r="50"
              fill="none" 
              stroke="hsl(174 100% 31%)" 
              strokeWidth="3"
              opacity="0.6"
              className="animate-radar-pulse-1"
            />
            <circle 
              cx="500" 
              cy="500" 
              r="50"
              fill="none" 
              stroke="hsl(174 100% 31%)" 
              strokeWidth="2"
              opacity="0.5"
              className="animate-radar-pulse-2"
            />
            <circle 
              cx="500" 
              cy="500" 
              r="50"
              fill="none" 
              stroke="hsl(174 100% 31%)" 
              strokeWidth="2"
              opacity="0.4"
              className="animate-radar-pulse-3"
            />

            {/* Rotating radar sweep line */}
            <g className="animate-radar-sweep origin-center" style={{ transformOrigin: '500px 500px' }}>
              <line 
                x1="500" 
                y1="500" 
                x2="500" 
                y2="100" 
                stroke="hsl(174 100% 31%)" 
                strokeWidth="2"
                opacity="0.7"
              />
              {/* Sweep arc/trail effect */}
              <path 
                d="M 500 500 L 500 100 A 400 400 0 0 1 850 350 Z"
                fill="url(#radarSweep)"
                opacity="0.3"
              />
            </g>
          </>
        )}
      </svg>

        {/* Concentric circles and radial lines - shown after pathways are displayed */}
      {showGrid && (
        <div className="absolute inset-0 flex items-center justify-center animate-fade-in">
          <svg 
            className="w-full h-full max-w-[min(100vw,100vh)] max-h-[min(100vw,100vh)]"
            viewBox="0 0 1000 1000" 
            preserveAspectRatio="xMidYMid meet"
          >
            {/* 2nd Outer concentric circle */}
                        <circle 
              cx="500" 
              cy="500" 
              r="820" 
              fill="none" 
              stroke="hsl(174 25% 70%)" 
              strokeWidth="1.5" 
              opacity="2"
            />
            <circle 
              cx="500" 
              cy="500" 
              r="620" 
              fill="none" 
              stroke="hsl(174 25% 70%)" 
              strokeWidth="1.5" 
              opacity="2"
            />

            {/* Outer concentric circle */}
            <circle 
              cx="500" 
              cy="500" 
              r="420" 
              fill="none" 
              stroke="hsl(174 25% 70%)" 
              strokeWidth="1.5" 
              opacity="2"
            />
            
            {/* Inner concentric circle */}
            <circle 
              cx="500" 
              cy="500" 
              r="200" 
              fill="none" 
              stroke="hsl(174 25% 70%)" 
              strokeWidth="1.5" 
              opacity="2"
            />
            
            {/* Radial lines from center */}
            {radialLines.map((line, index) => (
              <line
                key={index}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="hsl(174 25% 70%)"
                strokeWidth="1"
                opacity="2"
              />
            ))}
          </svg>
        </div>
      )}
    </div>
  );
};

export default RadialBackground;
