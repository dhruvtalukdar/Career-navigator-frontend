interface ConnectionLineProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

const ConnectionLine = ({ startX, startY, endX, endY }: ConnectionLineProps) => {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <line 
        x1={startX} 
        y1={startY} 
        x2={endX} 
        y2={endY} 
        stroke="hsl(174 100% 31%)" 
        strokeWidth="2"
      />
      <circle cx={startX} cy={startY} r="5" fill="hsl(174 100% 31%)" />
    </svg>
  );
};

export default ConnectionLine;
