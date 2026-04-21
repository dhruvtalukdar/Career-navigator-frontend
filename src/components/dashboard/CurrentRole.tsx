interface CurrentRoleProps {
  name: string;
  title: string;
  level: string;
  avatarUrl?: string;
}

const CurrentRole = ({ name, title, level, avatarUrl }: CurrentRoleProps) => {
  return (
    <div className="flex flex-col items-center">
      {/* Avatar with teal border */}
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border-4 border-primary shadow-lg overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {/* Placeholder avatar - silhouette style */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-amber-300">
              <circle cx="50" cy="35" r="22" fill="currentColor" opacity="0.8" />
              <ellipse cx="50" cy="85" rx="35" ry="28" fill="currentColor" opacity="0.6" />
            </svg>
          </div>
        )}
      </div>

      {/* Connection dot at top of profile */}
      <div className="w-3 h-3 rounded-full bg-primary -mt-1 shadow-sm" />
      
      {/* Role card */}
      <div className="bg-white rounded-lg shadow-lg px-6 py-3 text-center border border-border mt-2 min-w-[180px]">
        <h2 className="font-semibold text-foreground text-sm">{title}</h2>
        <p className="text-muted-foreground text-xs">{level}</p>
        <span className="inline-block mt-2 px-3 py-1 bg-primary text-primary-foreground text-xs rounded-full font-medium">
          Current Role
        </span>
      </div>
    </div>
  );
};

export default CurrentRole;
