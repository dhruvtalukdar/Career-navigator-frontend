import { Plus, Minus } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const ZoomControls = ({ zoom, onZoomIn, onZoomOut }: ZoomControlsProps) => {
  return (
    <div className="fixed top-28 right-6 flex items-center gap-2 bg-card px-3 py-2 rounded-lg shadow-md border border-border">
      <span className="text-sm text-muted-foreground">Zoom</span>
      <span className="text-sm font-medium text-primary">({zoom}%)</span>
      <button
        onClick={onZoomIn}
        className="p-1 hover:bg-muted rounded transition-colors"
        disabled={zoom >= 150}
      >
        <Plus className="w-4 h-4 text-muted-foreground" />
      </button>
      <button
        onClick={onZoomOut}
        className="p-1 hover:bg-muted rounded transition-colors"
        disabled={zoom <= 50}
      >
        <Minus className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
};

export default ZoomControls;
