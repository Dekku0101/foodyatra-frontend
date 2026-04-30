import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Sparkles, ChevronDown, LogOut, ArrowLeft, ArrowRight, User, Compass, Users, Dices } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { SPRING_HOVER, SPRING_TAP, SPRING_ENTRY, fadeIn } from '../motion/motionPresets';

interface NavbarProps {
  onLogout?: () => void;
  userRole?: string;
  onTabChange?: (tab: string) => void;
  variant?: 'default' | 'simple' | 'back';
  title?: string;
  backPath?: string;
  backLabel?: string;
}

const Navbar = ({
  onLogout,
  userRole,
  onTabChange,
  variant = 'default',
  title,
  backPath = '/dashboard',
  backLabel = 'Back'
}: NavbarProps) => {
  const [activeTab, setActiveTab] = useState('discover');
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const navigate = useNavigate();
  // Safe destructuring with fallback in case context is missing (though it shouldn't be)
  const locationContext = useLocation();
  const location = locationContext?.location;
  const manualSetLocation = locationContext?.manualSetLocation;

  const tabs = ['Discover', 'Community', 'Roulette'];
  const locations = ['Vadodara', 'Ahmedabad', 'Mumbai', 'Delhi', 'Surat'];

  const handleTabClick = (tab: string) => {
    const tabId = tab.toLowerCase().replace(' ', '-');
    setActiveTab(tabId);
    if (onTabChange) onTabChange(tabId);

    // Smooth scroll to section if on dashboard
    setTimeout(() => {
      const sectionId = tabId === 'discover' ? 'discover-section' :
        tabId === 'community' ? 'community-section' :
          tabId === 'roulette' ? 'roulette-section' : null;
      if (sectionId) {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleLogoClick = () => {
    if (variant !== 'default') {
      navigate('/dashboard');
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveTab('discover');
    if (onTabChange) onTabChange('discover');
  };

  // Render "Back" variant (e.g. for Food.tsx, Tours.tsx)
  if (variant === 'back') {
    return (
      <nav className="sticky top-0 z-50 px-4 py-4 backdrop-blur-md bg-background/50 border-b border-border/50">
        <div className="max-w-7xl mx-auto glass-card px-5 py-3 flex items-center justify-between">
          <motion.button
            whileHover={{ x: -2, transition: SPRING_HOVER }}
            onClick={() => navigate(backPath)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> {backLabel}
          </motion.button>

          {title && <h1 className="font-display font-bold text-xl">{title}</h1>}

          <div className="w-8" /> {/* Spacer for centering */}
        </div>
      </nav>
    );
  }

  // Render Default variant (Dashboard)
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={SPRING_ENTRY}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="glass-card px-5 py-3 flex items-center justify-between relative">
          {/* Left Section: Logo + Location */}
          <div className="flex items-center gap-6">
            <motion.div whileHover={{ scale: 1.02, transition: SPRING_HOVER }} whileTap={{ scale: 0.98, transition: SPRING_TAP }} onClick={handleLogoClick} className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary via-amber to-accent flex items-center justify-center shadow-lg"><span className="text-xl">🍛</span></div>
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary to-accent opacity-30 blur-lg -z-10" />
              </div>
              <div className="hidden sm:block">
                <span className="font-display font-bold text-xl text-foreground tracking-tight">FoodYatra</span>
                <span className="block text-[10px] text-muted-foreground -mt-0.5 tracking-widest uppercase">Taste Explorer</span>
              </div>
            </motion.div>

            <div className="hidden lg:block relative location-menu-container">
              <motion.button
                onClick={() => setLocationMenuOpen(!locationMenuOpen)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl glass-pill hover:border-primary/30 transition-all group"
              >
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <MapPin className="w-4 h-4 text-primary icon-glow" />
                <span className="text-sm font-medium">{location ? location.city : 'Select Location'}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground group-hover:text-foreground transition-all ${locationMenuOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {locationMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={SPRING_HOVER}
                    className="absolute top-full left-0 mt-2 w-48 glass-card overflow-hidden z-50"
                  >
                    {locations.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => {
                          if (manualSetLocation) manualSetLocation(loc);
                          setLocationMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors flex items-center gap-2"
                      >
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                        {loc}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Center Section: Navigation (Absolute Centered) */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 p-1.5 rounded-2xl bg-secondary/40 border border-white/[0.05]">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.toLowerCase().replace(' ', '-');
              return (
                <motion.button
                  key={tab}
                  whileHover={{ scale: 1.05, transition: SPRING_HOVER }}
                  whileTap={{ scale: 0.95, transition: SPRING_TAP }}
                  onClick={() => handleTabClick(tab)}
                  className={`relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {isActive && <motion.div layoutId="activeTabBg" className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-accent" style={{ boxShadow: '0 4px 20px hsl(var(--primary) / 0.4)' }} transition={SPRING_HOVER} />}
                  <span className="relative z-10">{tab}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Right Section: Controls */}
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.05, transition: SPRING_HOVER }} whileTap={{ scale: 0.95, transition: SPRING_TAP }}>
              <button
                onClick={() => handleTabClick('for-you')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl glass-pill hover:border-purple-500/50 transition-all group ${activeTab === 'for-you' ? 'bg-purple-500/20 border-purple-500/40' : 'bg-white/5 border-white/10'}`}
                title="Personalized Recommendations"
              >
                <Sparkles className={`w-4 h-4 ${activeTab === 'for-you' ? 'text-purple-400' : 'text-muted-foreground group-hover:text-purple-400'}`} />
                <span className={`text-sm font-medium ${activeTab === 'for-you' ? 'text-purple-100' : 'text-muted-foreground group-hover:text-foreground'}`}>For You</span>
              </button>
            </motion.div>

            {userRole === 'admin' && (
              <motion.div whileHover={{ scale: 1.05, transition: SPRING_HOVER }} whileTap={{ scale: 0.95, transition: SPRING_TAP }}>
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl glass-pill hover:border-primary/30 transition-all group bg-primary/20 border-primary/40"
                  title="Admin Panel"
                >
                  <ArrowRight className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Admin</span>
                </button>
              </motion.div>
            )}

            <motion.div whileHover={{ scale: 1.05, transition: SPRING_HOVER }} whileTap={{ scale: 0.95, transition: SPRING_TAP }}>
              <button
                onClick={onLogout}
                className="flex items-center justify-center w-10 h-10 rounded-xl glass-pill hover:bg-rose-500/20 hover:border-rose-500/30 transition-colors group"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-rose-500" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
