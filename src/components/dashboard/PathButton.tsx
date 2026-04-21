interface PathButtonProps {
  count: number;
  direction: 'upward' | 'lateral';
}

const PathButton = ({ count, direction }: PathButtonProps) => {
  return (
    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity shadow-md">
      +{count} More {direction === 'upward' ? 'Upward' : 'Lateral'} Paths
    </button>
  );
};

export default PathButton;
