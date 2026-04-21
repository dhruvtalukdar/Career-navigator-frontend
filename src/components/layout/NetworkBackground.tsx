import { useMemo } from 'react';

const NetworkBackground = () => {
  const nodes = useMemo(() => {
    const points: { x: number; y: number; size: number }[] = [];
    for (let i = 0; i < 40; i++) {
      points.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 4,
      });
    }
    return points;
  }, []);

  const connections = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 25) {
          lines.push({
            x1: nodes[i].x,
            y1: nodes[i].y,
            x2: nodes[j].x,
            y2: nodes[j].y,
          });
        }
      }
    }
    return lines;
  }, [nodes]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="networkGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(174 40% 90%)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(0 0% 97%)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect fill="url(#networkGradient)" width="100" height="100" />
        
        {connections.map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="hsl(174 30% 75%)"
            strokeWidth="0.1"
            strokeOpacity="0.6"
          />
        ))}
        
        {nodes.map((node, i) => (
          <circle
            key={i}
            cx={node.x}
            cy={node.y}
            r={node.size / 10}
            fill="hsl(174 50% 70%)"
            fillOpacity="0.4"
          />
        ))}
      </svg>
    </div>
  );
};

export default NetworkBackground;
