import { motion } from "framer-motion";
import { Utensils } from "lucide-react";
import foodHero from "@/assets/food-hero.jpg";

const HeroSection = () => {
  return (
    <div className="relative w-full h-full min-h-[400px] lg:min-h-full overflow-hidden rounded-3xl">
      {/* Food background image */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <img
          src={foodHero}
          alt="Delicious Indian cuisine spread"
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent lg:bg-gradient-to-l lg:from-transparent lg:via-transparent lg:to-background/90" />
      </motion.div>

      {/* Content overlay */}
      <div className="relative z-10 h-full flex flex-col justify-end lg:justify-center p-8 lg:p-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30"
            >
              <Utensils size={24} className="text-primary-foreground" />
            </motion.div>
            <div>
              <h1 className="text-xl font-display font-bold text-cream">
                FoodYatra
              </h1>
            </div>
          </div>
        </motion.div>

        {/* Main heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-4"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-tight text-cream">
            Discover the
            <br />
            <span className="text-primary">Soul of Indian</span>
            <br />
            <span className="text-cream">Cuisine</span>
          </h2>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-base md:text-lg text-cream/70 max-w-sm mb-6"
        >
          From street food gems to royal recipes, embark on a flavorful journey across India
        </motion.p>

        {/* Feature badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-wrap gap-3"
        >
          {["500+ Recipes", "Local Favorites", "AI Powered"].map((badge, i) => (
            <motion.span
              key={badge}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + i * 0.1 }}
              className="px-3 py-1.5 text-xs font-medium rounded-full bg-primary/20 text-primary border border-primary/30 backdrop-blur-sm"
            >
              {badge}
            </motion.span>
          ))}
        </motion.div>
      </div>

      {/* Decorative spice particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50 }}
            animate={{
              opacity: [0, 0.6, 0],
              y: [-20, -100],
              x: [0, (i % 2 === 0 ? 20 : -20)],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeOut",
            }}
            className="absolute w-2 h-2 rounded-full bg-primary/60"
            style={{
              left: `${15 + i * 15}%`,
              bottom: "20%",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
