

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-6 py-4 flex items-center gap-3">
        <span className="text-xl font-bold tracking-tight text-primary">SIEMENS</span>
        <span className="text-border">|</span>
        <span className="text-lg font-medium text-primary">Career Navigator</span>
      </div>
    </header>
  );
};

export default Header;
