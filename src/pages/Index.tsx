import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import LoginCard from "@/components/LoginCard";
import { SPRING_ENTRY } from "@/motion/motionPresets";

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px]" />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Main layout - Reversed for food focus */}
        <main className="flex-1 flex flex-col lg:flex-row items-stretch">
          {/* Hero section with food image - Left side on desktop */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={SPRING_ENTRY}
            className="w-full lg:w-[55%] p-4 lg:p-6"
          >
            <HeroSection />
          </motion.div>

          {/* Login card - Right side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING_ENTRY, delay: 0.2 }}
            className="w-full lg:w-[45%] flex items-center justify-center p-6 lg:p-12"
          >
            <LoginCard />
          </motion.div>
        </main>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...SPRING_ENTRY, delay: 0.4 }}
          className="relative z-10 py-4 px-6 text-center"
        >
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground/50">
            <a href="#" className="hover:text-muted-foreground transition-colors">
              Terms of Service
            </a>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
            <a href="#" className="hover:text-muted-foreground transition-colors">
              Privacy Policy
            </a>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
            <span>© 2024 FoodYatra</span>
          </div>
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;
