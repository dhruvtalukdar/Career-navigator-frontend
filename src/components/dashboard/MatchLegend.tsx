const MatchLegend = () => {
  return (
    <div className="fixed bottom-6 left-6 flex items-center gap-5 bg-white px-5 py-2.5 rounded-full shadow-md border border-border">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-match-good" />
        <span className="text-xs text-foreground font-medium">Good Match</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-primary" />
        <span className="text-xs text-foreground font-medium">Medium Match</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-match-low" />
        <span className="text-xs text-foreground font-medium">Low Match</span>
      </div>
    </div>
  );
};

export default MatchLegend;
