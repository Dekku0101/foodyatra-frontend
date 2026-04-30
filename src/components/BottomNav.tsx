const BottomNav = () => {
  return (
    <nav className="border-t border-border bg-background/80 backdrop-blur-sm sticky bottom-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-6">
          <a href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            Home
          </a>
          <a href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            Discover
          </a>
          <a href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            Community
          </a>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;


