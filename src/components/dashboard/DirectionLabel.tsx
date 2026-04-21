import { ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';

interface DirectionLabelProps {
  direction: 'upward' | 'lateral' | 'scope';
}

const DirectionLabel = ({ direction }: DirectionLabelProps) => {
  const config = {
    upward: {
      icon: ArrowUp,
      title: 'UPWARD',
      subtitle: 'MOVEMENT',
    },
    lateral: {
      icon: ArrowRight,
      title: 'LATERAL',
      subtitle: 'MOVEMENT',
    },
    scope: {
      icon: ArrowDown,
      title: 'CHANGE',
      subtitle: 'SCOPE',
    },
  };

  const { icon: Icon, title, subtitle } = config[direction];

  return (
    <div className="flex flex-col items-center opacity-40">
      <div className="w-10 h-10 rounded-full border-2 border-primary/50 bg-white/50 flex items-center justify-center mb-2">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <p className="text-sm font-bold tracking-[0.2em] text-primary/60">{title}</p>
      <p className="text-sm font-bold tracking-[0.2em] text-primary/60">{subtitle}</p>
    </div>
  );
};

export default DirectionLabel;
