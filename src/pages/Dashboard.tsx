
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useMotionValueEvent, animate } from 'framer-motion';

import {
  MapPin, Sparkles, ArrowRight, ChevronDown, User, Menu, X,
  Flame, Gem, Star, IndianRupee, Clock, Heart, RotateCw, Square,
  MessageCircle, Share2, Image, Hash, Send, MoreHorizontal, Bookmark,
  ZoomIn, ZoomOut, Locate, Navigation, Compass, Users, Dices, LogOut, Settings, Utensils, Search, Filter
} from 'lucide-react';
import { foodPlacesApi, famousPlaceApi, recommendationsApi } from '@/lib/api';
import { normalizeFoodType } from '@/lib/utils';
import { SPRING_HOVER, SPRING_TAP, SPRING_ENTRY } from '@/motion/motionPresets';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from '@/context/LocationContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import TourCard, { Tour } from '@/components/TourCard';
import TourModal from '@/components/TourModal';
import ZaykaAIChat from '@/components/ZaykaAIChat';
import Navbar from '@/components/Navbar';
import FoodCard from '@/components/FoodCard';
import MiniMap from '@/components/MiniMap';
import ScrollReveal from '@/components/ScrollReveal';
import CommunitySection from '@/components/CommunitySection';
import { toursApi } from '@/lib/api';
import {
  mockPosts,
  mockUser,
  navItems,
  famousRestaurantsArray,
  famousFoods,
  hiddenGems,
  mapPins,
  moods,
  moodRecommendations,
  mockFoodPlaces,
  MapPinType
} from '@/data/mockData';

// ==========================================
// DATA SECTION
// ==========================================
// Data has been moved to src/data/mockData.ts

// ==========================================
// HELPER COMPONENTS
// ==========================================

// --- FoodCard, MiniMap, ScrollReveal have been extracted to components ---

// ==========================================
// SECTIONS (INLINE)
// ==========================================

// Navbar has been moved to src/components/Navbar.tsx

// --- HeroSection ---
const HeroSection = ({ onOpenRoulette }: { onOpenRoulette: () => void }) => {
  const { requestLocation, isLoading } = useLocation();

  return (
    <section className="relative pt-28 pb-12 md:py-32 px-4 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] bg-accent/20 rounded-full blur-[100px]" />
      </div>
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={SPRING_ENTRY}>
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Food recommendations <span className="gradient-text">you can trust</span>
          </h1>
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING_ENTRY, delay: 0.2 }} className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Curated picks to help you choose where to eat
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING_ENTRY, delay: 0.4 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05, y: -2, transition: SPRING_HOVER }}
            whileTap={{ scale: 0.95, transition: SPRING_TAP }}
            onClick={onOpenRoulette}
            className="px-8 py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium backdrop-blur-sm transition-all flex items-center gap-2 w-full sm:w-auto justify-center group"
          >
            <Dices className="w-4 h-4 text-primary group-hover:rotate-180 transition-transform duration-500" />
            Food Roulette
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -2, transition: SPRING_HOVER }}
            whileTap={{ scale: 0.95, transition: SPRING_TAP }}
            onClick={() => document.getElementById('tours-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3 rounded-full border border-transparent hover:bg-white/5 text-muted-foreground hover:text-white font-medium transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Compass className="w-4 h-4" />
            Food Tours
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

// --- MoodSection ---
const MoodSection = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 neural-bg opacity-60" />
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute -right-40 top-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-20" style={{ background: 'conic-gradient(from 0deg, hsl(var(--primary) / 0.3), transparent, hsl(var(--accent) / 0.3), transparent, hsl(var(--primary) / 0.3))', filter: 'blur(60px)' }} />
      <div className="max-w-5xl mx-auto relative z-10">
        <ScrollReveal>
          <div className="text-center mb-12">
            <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill mb-6"><Sparkles className="w-4 h-4 text-primary" /><span className="text-sm font-medium">AI-Powered Recommendations</span></motion.div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">What's Your <span className="gradient-text">Mood</span> Today?</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Tell us how you're feeling and ZaykaAI will find the perfect food for you</p>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {moods.map((mood, index) => (
              <motion.button key={mood.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ opacity: { delay: index * 0.08 } }} whileHover={{ scale: 1.05, y: -4, transition: SPRING_HOVER }} whileTap={{ scale: 0.95, transition: SPRING_TAP }} onClick={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)} className={`relative px-6 py-3 rounded-2xl cursor-pointer transition-all duration-300 ${selectedMood === mood.id ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground border-transparent shadow-lg' : 'glass-card hover:border-primary/30'}`} style={{ boxShadow: selectedMood === mood.id ? '0 8px 32px hsl(var(--primary) / 0.4)' : undefined }}>
                <span className="flex items-center gap-2.5 font-medium"><span className="text-xl">{mood.emoji}</span>{mood.label}</span>
              </motion.button>
            ))}
          </div>
        </ScrollReveal>
        <AnimatePresence mode="wait">
          {selectedMood && (
            <motion.div key={selectedMood} initial={{ opacity: 0, y: 20, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -20, height: 0 }} transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }} className="overflow-hidden">
              <div className="glass-card p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"><Sparkles className="w-5 h-5 text-primary" /></div>
                    <div><span className="font-display font-semibold text-lg">ZaykaAI Recommends</span><p className="text-xs text-muted-foreground">Based on your {moods.find(m => m.id === selectedMood)?.label.toLowerCase()} mood</p></div>
                  </div>
                  <motion.button whileHover={{ x: 4 }} className="hidden sm:flex items-center gap-2 text-sm text-primary font-medium">See all<ArrowRight className="w-4 h-4" /></motion.button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {moodRecommendations[selectedMood].map((rec, index) => (
                    <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ y: -4, scale: 1.02 }} className="group p-5 rounded-2xl bg-gradient-to-br from-secondary/80 to-secondary/40 border border-white/[0.05] hover:border-primary/20 transition-all cursor-pointer will-change-transform">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-3xl shrink-0">{rec.image}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-semibold text-foreground group-hover:text-primary transition-colors truncate">{rec.dish}</p>
                          <p className="text-sm text-muted-foreground truncate">at {rec.place}</p>
                          <div className="flex items-center gap-1 mt-2"><Star className="w-3.5 h-3.5 text-accent fill-accent" /><span className="text-sm font-medium">{rec.rating}</span></div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

// --- PersonalizedSection ---
const PersonalizedSection = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [personality, setPersonality] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<number | string | null>(null);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const response = await recommendationsApi.getForYou();
        if (response.success && response.data) {
          setRecommendations(response.data);
          if ((response as any).userPersonality) {
            setPersonality((response as any).userPersonality);
          }
        }
      } catch (err) {
        console.error("Failed to fetch personalized recommendations", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  return (
    <section className="py-20 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-orange-500/5 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        <ScrollReveal>
          <div className="text-center mb-12">
            <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill mb-6 border-primary/20 bg-primary/10">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                {personality?.title ? `${personality.icon || '✨'} Profile: ${personality.title}` : 'AI For You Engine'}
              </span>
            </motion.div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Recommended <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-amber-400">For You</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Dynamic culinary picks adapted in real-time to your preferences, favorites, and explore history.
            </p>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[26rem] rounded-3xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 group/list">
            {recommendations.slice(0, 8).map((food, index) => (
              <ScrollReveal key={food.id || index} delay={index * 0.05}>
                <div
                  onClick={() => {
                    if (food.type === 'foodplace' && food.id) {
                      navigate(`/place/${food.id}`);
                    } else {
                      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(food.name + ', ' + food.area + ', Vadodara')}`, '_blank');
                    }
                  }}
                  className="rounded-3xl border border-white/10 hover:border-primary/40 bg-card/80 overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group cursor-pointer h-[24rem]"
                >
                  <div className="relative h-48 w-full shrink-0 overflow-hidden bg-black/40">
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/SevUsal.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-black/30 to-black/20" />
                    
                    {/* Top Contextual Badge */}
                    <div className="absolute top-3 left-3 z-30">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-purple-500/40 bg-purple-500/20 text-purple-300 backdrop-blur-md flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3" />
                        AI Pick
                      </span>
                    </div>

                    {/* Bottom of Image: Dietary Status + Rating */}
                    <div className="absolute bottom-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
                      <div 
                        className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg border border-white/15 shadow-sm"
                        title={food.isVeg ? "100% Pure Vegetarian" : "Non-Vegetarian"}
                      >
                        <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${food.isVeg ? 'border-emerald-500 bg-emerald-950/90' : 'border-rose-500 bg-rose-950/90'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${food.isVeg ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        </div>
                        <span className={`text-[10px] font-bold tracking-wider uppercase ${food.isVeg ? 'text-emerald-300' : 'text-rose-300'}`}>
                          {food.isVeg ? 'Veg' : 'Non-Veg'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15 shadow-sm text-xs font-bold text-white">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        {Number(food.rating || 4.5).toFixed(1)}
                      </div>
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-snug tracking-tight">
                        {food.name}
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-medium text-foreground/80 truncate">{food.subtitle || food.area || 'Vadodara'}</span>
                      </p>
                    </div>

                    {/* Why Recommended Reason Pill */}
                    {food.whyRecommended && (
                      <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <p className="text-[11px] text-primary/90 font-medium line-clamp-2 leading-tight">
                          {food.whyRecommended}
                        </p>
                      </div>
                    )}

                    {/* Footer Bar */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-semibold">{food.price || '₹150 Avg'}</span>
                      <div className="flex items-center gap-1 text-primary font-bold group-hover:translate-x-0.5 transition-transform">
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-card rounded-3xl border-dashed border-white/10">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-xl font-medium text-foreground">Discovering your flavor profile...</p>
            <p className="text-muted-foreground mt-2">Explore dishes or set your preferences to receive tailored picks!</p>
          </div>
        )}
      </div>
    </section>
  );
};

// --- DiscoverSection ---
const DiscoverSection = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedLocationsList, setSelectedLocationsList] = useState<any[]>([]);
  const [hoveredCard, setHoveredCard] = useState<number | string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [famousFoodsData, setFamousFoodsData] = useState<any[]>(famousFoods);
  const [famousRestaurantsData, setFamousRestaurantsData] = useState<any[]>(famousRestaurantsArray);
  // Track which food IDs came from the DB (famousplace) vs static
  const [dbFoodIds, setDbFoodIds] = useState<Set<string>>(new Set());

  const getItemPrice = (item: any): number => {
    if (item.averagePrice !== undefined && item.averagePrice !== null && !isNaN(Number(item.averagePrice))) {
      return Number(item.averagePrice);
    }
    if (item.price !== undefined && item.price !== null && !isNaN(Number(item.price))) {
      return Number(item.price);
    }
    if (item.priceRange) {
      const parts = String(item.priceRange).replace(/[^0-9-]/g, '').split('-');
      const min = parseInt(parts[0]);
      if (!isNaN(min)) return min;
    }
    return 0;
  };

  useEffect(() => {
    const fetchFamousPlaces = async () => {
      try {
        const response = await famousPlaceApi.getAll();
        if (response.success && Array.isArray(response.data) && response.data.length > 0) {
          // Transform backend data to FoodCard format
          const formattedData = (response.data as any[]).map((item: any) => {
            const bestLocation = (item.locations || []).reduce((prev: any, current: any) =>
              ((current?.rating || 0) > (prev?.rating || 0)) ? current : prev, item.locations?.[0] || {});

            const itemIsVeg = normalizeFoodType(item) === 'veg';

            const staticMatch = famousFoods.find(f => f.name.toLowerCase() === item.dishName?.toLowerCase());
            const derivedPriceRange = staticMatch?.priceRange || (
              bestLocation.menu && bestLocation.menu.length > 0
                ? `${Math.min(...bestLocation.menu.map((m: any) => m.price || 100))}-${Math.max(...bestLocation.menu.map((m: any) => m.price || 150))}`
                : '150-300'
            );

            return {
              id: item._id,
              name: item.dishName,
              restaurant: bestLocation.name || 'Unknown',
              area: bestLocation.area || item.city || 'Vadodara',
              isVeg: item.isVeg !== undefined ? Boolean(item.isVeg) : itemIsVeg,
              priceRange: derivedPriceRange,
              rating: bestLocation.rating || 4.5,
              badge: 'famous',
              image: item.imageUrl,
              locations: item.locations, // Store all locations
              cuisine: item.cuisine,
              tags: item.tags,
              description: item.description
            };
          });

          // Merge DB famous places with static famousFoods so nothing is omitted
          setFamousFoodsData(() => {
            const dbMap = new Map(formattedData.map((f: any) => [f.name.toLowerCase(), f]));
            const merged = [...formattedData];
            famousFoods.forEach(staticFood => {
              if (!dbMap.has(staticFood.name.toLowerCase())) {
                merged.push(staticFood);
              }
            });
            return merged;
          });
          setDbFoodIds(new Set(formattedData.map((f: any) => String(f.id))));
        }

        // Also fetch all food places from the DB to populate Famous Restaurants
        const foodPlacesRes = await foodPlacesApi.getAllFoodPlaces();
        if (foodPlacesRes.success && Array.isArray(foodPlacesRes.data) && foodPlacesRes.data.length > 0) {
          const dbRestaurants = (foodPlacesRes.data as any[]).map((p: any) => ({
            id: p._id,
            _id: p._id,
            name: p.name,
            restaurant: p.name,
            area: p.area || p.city || 'Vadodara',
            city: p.city || 'Vadodara',
            isVeg: p.isVeg,
            priceRange: p.averagePrice ? `₹${p.averagePrice}` : '300-600',
            averagePrice: p.averagePrice,
            rating: p.rating || 4.5,
            badge: 'famous' as const,
            image: p.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700&q=80',
            cuisine: p.cuisine || p.foodType,
            tags: p.tags || ['Famous', 'Popular'],
            description: p.famousDish ? `Famous for ${p.famousDish}` : `${p.cuisine} in ${p.area}`,
            lat: p.latitude,
            lng: p.longitude,
            menu: p.menu
          }));

          setFamousRestaurantsData(() => {
            // Build a map of DB records by name for quick lookup
            const dbByName = new Map<string, any>();
            dbRestaurants.forEach(item => dbByName.set(item.name.toLowerCase(), item));

            // Only show the curated static list — but enrich with live DB data (image, rating) where available
            return famousRestaurantsArray.map(staticItem => {
              const dbMatch = dbByName.get(staticItem.name.toLowerCase());
              if (!dbMatch) return staticItem;
              // Prefer local image from static if it's already a local path, otherwise use DB image
              const bestImage = staticItem.image?.startsWith('/images/')
                ? staticItem.image
                : (dbMatch.image?.startsWith('/images/') ? dbMatch.image : staticItem.image);
              return {
                ...staticItem,
                _id: dbMatch._id || dbMatch.id,
                image: bestImage,
                rating: dbMatch.rating || staticItem.rating,
                averagePrice: dbMatch.averagePrice || staticItem.averagePrice,
                menu: dbMatch.menu || staticItem.menu,
              };
            });
          });
        }
      } catch (error) {
        console.error("Failed to fetch famous places or food places:", error);
      }
    };
    fetchFamousPlaces();
  }, []);

  // Filter helper for foods, famous restaurants, and hidden gems
  const filterItems = (items: any[], sectionName: string = 'Items') => {
    const selectedTypeNorm = normalizeFoodType(typeFilter);
    const isFilteringType = typeFilter !== 'all' && typeFilter !== 'any';

    const result = items.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.restaurant && item.restaurant.toLowerCase().includes(q)) ||
        (item.area && item.area.toLowerCase().includes(q)) ||
        (item.cuisine && item.cuisine.toLowerCase().includes(q)) ||
        (item.tags && Array.isArray(item.tags) && item.tags.some((t: string) => t.toLowerCase().includes(q))) ||
        (item.description && item.description.toLowerCase().includes(q))
      );

      let matchesType = true;
      if (isFilteringType) {
        matchesType = normalizeFoodType(item) === selectedTypeNorm;
      }

      let matchesPrice = true;
      if (priceFilter !== 'all' && priceFilter !== 'any') {
        const itemPrice = getItemPrice(item);
        if (priceFilter === 'low') matchesPrice = itemPrice < 150;
        else if (priceFilter === 'medium') matchesPrice = itemPrice >= 150 && itemPrice <= 350;
        else if (priceFilter === 'high') matchesPrice = itemPrice > 350;
      }

      return matchesSearch && matchesType && matchesPrice;
    });

    return result;
  };

  const filteredFamousFoods = filterItems(famousFoodsData, 'Famous Foods');
  const filteredFamousRestaurants = filterItems(famousRestaurantsData, 'Famous Restaurants');
  const filteredHiddenGems = filterItems(hiddenGems, 'Hidden Gems');

  // Combine static and DB data for mapping based on active filter results
  const mapFoodPlaces = useMemo(() => {
    return [...filteredFamousFoods, ...filteredFamousRestaurants, ...filteredHiddenGems];
  }, [filteredFamousFoods, filteredFamousRestaurants, filteredHiddenGems]);

  const handleCardClick = (foodItem: any) => {
    const idStr = String(foodItem.id);
    // DB-fetched famous foods have MongoDB ObjectID strings; static have numeric IDs
    const type = dbFoodIds.has(idStr) ? 'famousplace' : 'static';
    navigate(`/place/${idStr}?type=${type}`);
  };

  return (
    <section className="py-12 md:py-24 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
        <div className="lg:col-span-2 space-y-12">

          {/* Search & Filter Bar */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search dishes, restaurants, cuisine (e.g. Biryani, Seekh Kebab, Maharashtrian)..."
                className="pl-10 bg-secondary/30 border-white/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-full bg-secondary/30 border-white/10">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Price</SelectItem>
                  <SelectItem value="low">Budget</SelectItem>
                  <SelectItem value="medium">Mid-Range</SelectItem>
                  <SelectItem value="high">Premium</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full bg-secondary/30 border-white/10">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="veg">Veg</SelectItem>
                  <SelectItem value="non-veg">Non-Veg</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <ScrollReveal>
              <div className="flex items-center justify-between mb-8 mt-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center"><Flame className="w-6 h-6 text-primary" /></div>
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold">Famous Food</h2>
                    <p className="text-sm text-muted-foreground mt-1">Tap a dish to see famous places that serve it</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
            <div className="max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredFamousFoods.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No famous foods match your criteria.</p>
              ) : (
                <AnimatePresence mode="popLayout">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {filteredFamousFoods.map((food, index) => (
                      <motion.div
                        key={food.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10, scale: 0.97 }}
                        transition={{ duration: 0.25, delay: index * 0.05 }}
                      >
                        <FoodCard
                          {...food}
                          onClick={() => handleCardClick(food)}
                          onHover={() => setHoveredCard(food.id)}
                          onLeave={() => setHoveredCard(null)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </div>
          </div>

          <div>
            <ScrollReveal direction="left">
              <div className="flex items-center justify-between mb-8 mt-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20 flex items-center justify-center"><Utensils className="w-6 h-6 text-amber-500" /></div>
                  <div><h2 className="font-display text-2xl md:text-3xl font-bold">Famous Restaurants</h2><p className="text-sm text-muted-foreground mt-1">Iconic dining destinations</p></div>
                </div>
                <motion.button whileHover={{ x: 4, scale: 1.05 }} className="hidden sm:flex items-center gap-2 text-sm text-amber-500 font-medium hover:text-amber-400 transition-colors hover:shadow-glow rounded-full px-3 py-1">View all<ArrowRight className="w-4 h-4" /></motion.button>
              </div>
            </ScrollReveal>

            <div>
              {filteredFamousRestaurants.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No famous restaurants match your criteria.</p>
              ) : (
                <AnimatePresence mode="popLayout">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {filteredFamousRestaurants.map((restaurant, index) => (
                      <motion.div
                        key={restaurant.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10, scale: 0.97 }}
                        transition={{ duration: 0.25, delay: index * 0.05 }}
                      >
                        <FoodCard
                          {...restaurant}
                          onClick={() => {
                            if (restaurant._id || (/^[a-f\d]{24}$/i.test(String(restaurant.id)))) {
                              navigate(`/place/${restaurant._id || restaurant.id}?type=foodplace`);
                            } else {
                              navigate(`/place/${restaurant.id}?type=static`);
                            }
                          }}
                          onHover={() => setHoveredCard(restaurant.id)}
                          onLeave={() => setHoveredCard(null)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </div>
          </div>

          <div>
            <ScrollReveal direction="left">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center"><Gem className="w-6 h-6 text-accent" /></div>
                  <div><h2 className="font-display text-2xl md:text-3xl font-bold">Hidden Gems</h2><p className="text-sm text-muted-foreground mt-1">Local secrets worth discovering</p></div>
                </div>
                <motion.button whileHover={{ x: 4, scale: 1.05 }} className="hidden sm:flex items-center gap-2 text-sm text-accent font-medium hover:text-primary transition-colors hover:shadow-glow rounded-full px-3 py-1">Explore more<ArrowRight className="w-4 h-4" /></motion.button>
              </div>
            </ScrollReveal>
            <div>
              {filteredHiddenGems.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No hidden gems match your criteria.</p>
              ) : (
                <AnimatePresence mode="popLayout">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {filteredHiddenGems.map((food, index) => (
                      <motion.div
                        key={food.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10, scale: 0.97 }}
                        transition={{ duration: 0.25, delay: index * 0.05 }}
                      >
                        <FoodCard {...food} imageFit="contain" onClick={() => navigate(`/place/${food.id}?type=static`)} onHover={() => setHoveredCard(food.id)} onLeave={() => setHoveredCard(null)} />
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </div>
          </div>

        </div>

        {/* Map Column */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 space-y-6">
            <MiniMap
              foodPlaces={mapFoodPlaces}
              activePin={hoveredCard}
              label="Vadodara Food Map"
            />

            <div className="mt-4 p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-center">
              {selectedLocationsList.length > 0 ? (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <p className="text-sm font-semibold text-primary mb-2 border-b border-white/10 pb-2">{selectedLocation}</p>
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {selectedLocationsList.map((loc: any, idx: number) => (
                      <div key={idx} className="text-left bg-white/5 p-2 rounded-lg hover:bg-white/10 transition-colors">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-foreground">{loc.name}</span>
                          <span className="text-xs text-amber-500 font-bold flex items-center gap-0.5"><Star className="w-3 h-3" />{loc.rating}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-muted-foreground">{loc.area}</span>
                          {/* <span className="text-[10px] text-muted-foreground/70">{loc.city}</span> */}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : selectedLocation ? (
                <p className="text-base font-medium text-foreground animate-in fade-in slide-in-from-top-2">
                  📍 {selectedLocation}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a food to see famous locations
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- CommunitySection imported from @/components/CommunitySection ---


// --- FoodRouletteSection (Smart Food Roulette with 8 Modes) ---
const ROULETTE_MODES = [
  { id: 'all', label: 'Surprise Me', icon: '🎲', desc: 'Any Vadodara culinary legend' },
  { id: 'budget', label: 'Under ₹200', icon: '💰', desc: 'Pocket-friendly budget feasts' },
  { id: 'veg', label: 'Pure Veg', icon: '🌱', desc: '100% vegetarian delicacies' },
  { id: 'spicy', label: 'Spicy Challenge', icon: '🌶️', desc: 'Bold, fiery local flavors' },
  { id: 'date', label: 'Date Night', icon: '❤️', desc: 'Cozy ambience & fine dining' },
  { id: 'family', label: 'Family Friendly', icon: '👨‍👩‍👧', desc: 'Grand thalis & sharing spots' },
  { id: 'latenight', label: 'Late Night', icon: '🌙', desc: 'Midnight street food & snacks' },
  { id: 'ai', label: 'AI Picks For You', icon: '🤖', desc: 'Personalized to your taste profile' },
];

const FoodRouletteSection = ({ onClose, foodData }: { onClose: () => void; foodData?: any[] }) => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState('all');
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<any | null>(null);
  const [pendingWinner, setPendingWinner] = useState<any | null>(null);
  const [targetX, setTargetX] = useState(0);
  const [spinCount, setSpinCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const reelViewportRef = useRef<HTMLDivElement>(null);
  const reelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const rawItems = useMemo(
    () => (foodData && foodData.length > 0 ? foodData : famousRestaurantsArray),
    [foodData]
  );

  // Filter pool according to chosen roulette mode
  const baseItems = useMemo(() => {
    if (selectedMode === 'budget') {
      return rawItems.filter(item => (item.averagePrice && item.averagePrice <= 200) || item.priceRange?.includes('50') || item.priceRange?.includes('100'));
    }
    if (selectedMode === 'veg') {
      return rawItems.filter(item => item.isVeg === true);
    }
    if (selectedMode === 'spicy') {
      return rawItems.filter(item => {
        const text = `${item.name || ''} ${item.dish || ''} ${item.title || ''}`.toLowerCase();
        return text.includes('usal') || text.includes('kachori') || text.includes('tikha') || text.includes('spicy') || text.includes('sev') || text.includes('vada');
      });
    }
    if (selectedMode === 'date') {
      return rawItems.filter(item => item.foodType === 'cafe' || item.foodType === 'restaurant' || (item.rating && item.rating >= 4.5));
    }
    if (selectedMode === 'family') {
      return rawItems.filter(item => {
        const text = `${item.name || ''} ${item.dish || ''} ${item.title || ''}`.toLowerCase();
        return text.includes('thali') || text.includes('restaurant') || item.foodType === 'restaurant';
      });
    }
    if (selectedMode === 'latenight') {
      return rawItems.filter(item => {
        const text = `${item.name || ''} ${item.area || ''} ${item.restaurant || ''}`.toLowerCase();
        return text.includes('station') || text.includes('fatehgunj') || text.includes('tea') || text.includes('stall') || text.includes('night');
      });
    }
    if (selectedMode === 'ai') {
      return rawItems.filter(item => (item.rating && item.rating >= 4.4) || item.badge === 'famous');
    }
    return rawItems;
  }, [rawItems, selectedMode]);

  // Repeat items for smooth infinite horizontal scrolling reel
  const safeItems = baseItems.length > 0 ? baseItems : rawItems;
  const repeatedItems = useMemo(
    () => Array.from({ length: 16 }, () => safeItems).flat(),
    [safeItems]
  );

  const cardWidth = isMobile ? 160 : 220;
  const gap = 16;
  const itemStep = cardWidth + gap;

  useEffect(() => {
    const updateInitialX = () => {
      const viewport = reelViewportRef.current;
      const viewportWidth = viewport?.getBoundingClientRect().width || (isMobile ? 340 : 740);
      const initial = (viewportWidth / 2) - (cardWidth / 2);
      setTargetX(initial);
    };

    const timer = setTimeout(updateInitialX, 60);
    window.addEventListener('resize', updateInitialX);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateInitialX);
    };
  }, [safeItems, cardWidth, isMobile]);

  const handleSpin = () => {
    if (spinning || !safeItems.length) return;

    setWinner(null);
    setSpinning(true);

    const N = safeItems.length;
    const randomIndex = Math.floor(Math.random() * N);
    const selected = safeItems[randomIndex];
    setPendingWinner(selected);

    const viewport = reelViewportRef.current;
    const reel = reelRef.current;
    const viewportWidth = viewport?.getBoundingClientRect().width || (isMobile ? 340 : 740);

    const firstCard = reel?.children[0] as HTMLElement;
    const measuredCardWidth = firstCard ? firstCard.getBoundingClientRect().width : cardWidth;
    const measuredStep = measuredCardWidth + gap;

    const passIndex = 4 + ((spinCount * 3) % 9);
    setSpinCount(prev => prev + 1);

    const targetCardIndex = passIndex * N + randomIndex;
    const calculatedTargetX = -(targetCardIndex * measuredStep) + (viewportWidth / 2) - (measuredCardWidth / 2);
    setTargetX(calculatedTargetX);
  };

  const getWinnerWhyReason = (item: any) => {
    if (selectedMode === 'budget') return 'Selected because it is an iconic budget bite under ₹200';
    if (selectedMode === 'veg') return '100% Pure Vegetarian delicacy rated highly by locals';
    if (selectedMode === 'spicy') return 'Chosen for its fiery authentic Vadodara street spice';
    if (selectedMode === 'date') return 'Great ambience and romantic culinary vibe';
    if (selectedMode === 'family') return 'Perfect family dining option with generous portions';
    if (selectedMode === 'latenight') return 'Legendary spot for late-night cravings in Vadodara';
    if (selectedMode === 'ai') return `AI top pick matching your taste profile (${item.rating || 4.5}★)`;
    return 'Destiny picked this legendary Vadodara food spot for your next meal!';
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto overflow-x-hidden">
      <button onClick={onClose} className="fixed top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-[110] shadow-lg">
        <X className="w-6 h-6" />
      </button>

      <section className="relative w-full max-w-7xl mx-auto px-4 py-8 md:py-12 overflow-visible min-h-full flex flex-col justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto w-full my-auto space-y-6">
          <ScrollReveal>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill mb-3 border border-primary/20 bg-primary/10">
                <Dices className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs font-bold tracking-wide text-primary uppercase">Smart Food Roulette 2.0</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-extrabold mb-2 tracking-tight">
                Can't Decide? Let <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-amber-400">Destiny Choose</span>
              </h2>
              <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                Select your vibe mode and spin the roulette to discover your next food destination.
              </p>
            </div>
          </ScrollReveal>

          {/* 8 Roulette Modes Pill Selector */}
          <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
            {ROULETTE_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  if (!spinning) {
                    setSelectedMode(mode.id);
                    setWinner(null);
                  }
                }}
                disabled={spinning}
                className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  selectedMode === mode.id
                    ? 'bg-gradient-to-r from-primary to-orange-500 text-white shadow-lg shadow-primary/30 border-transparent scale-105'
                    : 'bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground border border-white/10'
                }`}
              >
                <span>{mode.icon}</span>
                <span>{mode.label}</span>
              </button>
            ))}
          </div>

          {/* Horizontal Reel Stage Container */}
          <div
            ref={reelViewportRef}
            className="relative h-[240px] md:h-[280px] w-full max-w-[760px] mx-auto overflow-hidden flex items-center group rounded-3xl bg-white/[0.02] border border-white/10 select-none shadow-2xl"
          >
            {/* Edge Gradient Masks */}
            <div className="absolute inset-y-0 left-0 w-24 md:w-36 bg-gradient-to-r from-black via-black/80 to-transparent z-20 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 md:w-36 bg-gradient-to-l from-black via-black/80 to-transparent z-20 pointer-events-none" />

            {/* Central Target Selector Box */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center justify-between">
              <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[18px] border-t-primary filter drop-shadow-[0_4px_10px_rgba(245,158,11,0.8)]" />
              
              <div
                style={{ width: cardWidth, height: isMobile ? 160 : 210 }}
                className={`rounded-2xl border-2 border-primary shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all duration-300 ${spinning ? 'scale-105 border-orange-400 shadow-[0_0_50px_rgba(245,158,11,0.8)]' : ''}`}
              />
              
              <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[18px] border-b-primary filter drop-shadow-[0_-4px_10px_rgba(245,158,11,0.8)]" />
            </div>

            {/* Moving Reel Strip */}
            <motion.div
              ref={reelRef}
              className="flex gap-4 absolute left-0"
              animate={{ x: targetX }}
              transition={{
                duration: 4,
                ease: [0.12, 0.8, 0.2, 1]
              }}
              onAnimationComplete={() => {
                if (spinning && pendingWinner) {
                  setWinner(pendingWinner);
                  setSpinning(false);
                }
              }}
            >
              {repeatedItems.map((item, index) => (
                <div
                  key={`${item.id || item._id || 'item'}-${index}`}
                  style={{ width: cardWidth, height: isMobile ? 160 : 210 }}
                  className="flex-shrink-0 rounded-2xl overflow-hidden glass-card border border-white/10 shadow-2xl relative group/card"
                >
                  <img
                    src={item.image || item.imageUrl || '/images/SevUsal.png'}
                    alt={item.name || item.title}
                    className="w-full h-full object-cover brightness-75 group-hover/card:brightness-100 transition-all duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/SevUsal.png';
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white">
                    <div className="flex items-center gap-1.5">
                      {item.isVeg !== undefined && (
                        <div className={`w-3 h-3 border-[1.5px] ${item.isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center bg-white shrink-0 rounded-xs`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                        </div>
                      )}
                      <p className="text-xs font-bold truncate text-primary">{item.name || item.title}</p>
                    </div>
                    <p className="text-[10px] text-white/70 truncate mt-0.5">{item.restaurant || item.area || item.city || 'Vadodara'}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Controls: Spin Button */}
          <div className="flex justify-center pt-2">
            <motion.button
              whileHover={spinning ? undefined : { scale: 1.05, transition: SPRING_HOVER }}
              whileTap={spinning ? undefined : { scale: 0.95, transition: SPRING_TAP }}
              onClick={handleSpin}
              disabled={spinning}
              className="relative group overflow-hidden px-12 py-4 rounded-full bg-gradient-to-r from-primary via-orange-500 to-amber-500 text-white font-bold tracking-widest uppercase shadow-[0_10px_40px_-10px_rgba(245,158,11,0.6)] border border-white/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center gap-2 text-sm font-extrabold">
                {spinning ? (
                  <>
                    <RotateCw className="w-5 h-5 animate-spin text-white" /> DECIDING YOUR FATE...
                  </>
                ) : (
                  <>
                    SPIN FOR {ROULETTE_MODES.find(m => m.id === selectedMode)?.label.toUpperCase()} <Sparkles className="w-5 h-5" />
                  </>
                )}
              </span>
            </motion.button>
          </div>

          {/* Winner Reveal Modal */}
          <AnimatePresence>
            {winner && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={SPRING_ENTRY}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
              >
                <div className="relative bg-card border border-primary/50 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden text-foreground">
                  <div className="relative h-52 overflow-hidden bg-black/40">
                    <img
                      src={winner.image || winner.imageUrl || '/images/SevUsal.png'}
                      alt={winner.name || winner.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/SevUsal.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    
                    <button
                      onClick={() => setWinner(null)}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white/80 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="absolute bottom-3 left-4 right-4">
                      <div className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground mb-1 shadow">
                        <Sparkles className="w-3 h-3" /> WINNER PICKED!
                      </div>
                      <h3 className="text-2xl font-black text-white leading-tight truncate">
                        {winner.name || winner.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Reason Box */}
                    <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-primary/95 font-medium leading-relaxed">
                        {getWinnerWhyReason(winner)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs py-2 border-y border-white/10">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span>{winner.area || winner.city || 'Vadodara'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{winner.rating || 4.5} ★</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => {
                          const placeName = winner.name || winner.title || '';
                          const placeAddr = winner.address || (winner.area || winner.city || 'Vadodara');
                          window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${placeName}, ${placeAddr}`)}`, '_blank');
                        }}
                        className="py-2.5 px-3 rounded-xl border border-white/15 hover:bg-white/10 text-foreground text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
                      >
                        <MapPin className="w-3.5 h-3.5 text-primary" /> Open in Maps
                      </button>

                      {winner.id || winner._id ? (
                        <button
                          onClick={() => {
                            navigate(`/place/${winner.id || winner._id}`);
                            onClose();
                          }}
                          className="py-2.5 px-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all text-center"
                        >
                          View Details
                        </button>
                      ) : (
                        <button
                          onClick={handleSpin}
                          className="py-2.5 px-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all text-center"
                        >
                          Spin Again
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

// --- FoodTourSection ---
const FoodTourSection = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await toursApi.getAllTours();
        if (response.success && response.data && (response.data as any[]).length > 0) {
          setTours(response.data as Tour[]);
        } else {
          // Fallback if API returns success but empty data
          setTours([
            { _id: '1', title: 'Vadodara Street Food Walk', city: 'Vadodara', price: 499, duration: '3 Hours', description: 'Explore the hidden gems of Old Vadodara with our expert guide.', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80', stops: [] },
            { _id: '2', title: 'Midnight Food Safari', city: 'Vadodara', price: 699, duration: '4 Hours', description: 'Experience the vibrant nightlife and late-night eats of the city.', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80', stops: [] }
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch tours", error);
        // Fallback dummy data if API fails or is empty for demo
        if (!tours.length) {
          setTours([
            { _id: '1', title: 'Vadodara Street Food Walk', city: 'Vadodara', price: 499, duration: '3 Hours', description: 'Explore the hidden gems of Old Vadodara with our expert guide.', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80', stops: [] },
            { _id: '2', title: 'Midnight Food Safari', city: 'Vadodara', price: 699, duration: '4 Hours', description: 'Experience the vibrant nightlife and late-night eats of the city.', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80', stops: [] }

          ]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);



  return (
    <section className="py-20 px-4 relative bg-black/20">
      <div className="max-w-7xl mx-auto">
        {/* Removed ScrollReveal to debug visibility */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill mb-4 border border-primary/20 bg-primary/5">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold tracking-wider text-primary uppercase">Curated Journeys</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Food <span className="text-primary">Tours</span>
            </h2>
            <p className="text-gray-400 max-w-xl text-lg">
              Discover the city's culinary secrets with our guided food walks.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[28rem] rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 group/list">
            {tours.map((tour, index) => (
              <ScrollReveal key={tour._id} delay={index * 0.1}>
                <TourCard tour={tour} onClick={() => navigate(`/place/${tour._id}?type=tour`)} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};



// --- BottomNav ---
const BottomNav = ({ onTabChange }: { onTabChange?: (tab: string) => void }) => {
  const [activeTab, setActiveTab] = useState('discover');

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }

    setTimeout(() => {
      const sectionId = tabId === 'discover' ? 'discover-section' :
        tabId === 'community' ? 'community-section' :
          tabId === 'tours' ? 'tours-section' :
            tabId === 'roulette' ? 'roulette-section' :
              tabId === 'profile' ? 'profile-section' : null;
      if (sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else if (tabId === 'profile') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <motion.nav initial={{ y: 100 }} animate={{ y: 0 }} transition={{ ...SPRING_ENTRY, delay: 0.5 }} className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="mx-3 mb-3">
        <div className="glass-card px-2 py-2 flex items-center justify-around border-white/[0.1]">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.9, transition: SPRING_TAP }}
                onClick={() => handleTabClick(item.id)}
                className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {isActive && <motion.div layoutId="bottomNavActive" className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20" transition={SPRING_HOVER} />}
                <div className="relative"><item.icon className={`w-5 h-5 ${isActive ? 'icon-glow' : ''}`} /></div>
                <span className="text-[10px] font-medium relative">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
};

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================

const Dashboard = () => {
  const [user, setUser] = useState<{ id: string; name: string; email: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { location } = useLocation();
  const { toast } = useToast();

  // --- Zayka AI: Data Aggregation (Lifted from DiscoverSection) ---
  const [zaykaFoodData, setZaykaFoodData] = useState<any[]>([...famousFoods, ...famousRestaurantsArray, ...hiddenGems]);
  const [showRoulette, setShowRoulette] = useState(false);

  useEffect(() => {
    const fetchForZayka = async () => {
      try {
        const api = await import('@/lib/api');
        const response = await api.famousPlaceApi.getAll();
        if (response.success && response.data) {
          const formatted = (response.data as any[]).map((item: any) => {
            const bestLocation = item.locations.reduce((prev: any, current: any) =>
              (current.rating > prev.rating) ? current : prev, item.locations[0] || {});
            return {
              id: item._id,
              name: item.dishName,
              restaurant: bestLocation.name || 'Unknown',
              area: bestLocation.area || item.city || 'Vadodara',
              isVeg: item.isVeg !== undefined ? Boolean(item.isVeg) : true,
              priceRange: '50-150',
              rating: bestLocation.rating || 4.5,
              badge: 'famous',
              image: item.imageUrl,
              locations: item.locations
            };
          });
          // Combine with static
          setZaykaFoodData([...formatted, ...famousRestaurantsArray, ...hiddenGems]);
        }
      } catch (e) { console.error("Zayka Data Fetch Error", e); }
    };
    fetchForZayka();
  }, []);

  const getRoleFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return undefined;
      const parts = token.split('.');
      if (parts.length !== 3) return undefined;
      const json = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      return json?.role;
    } catch {
      return undefined;
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await import('@/lib/api').then(m => m.authApi.getCurrentUser());
        if (response.success && response.user) {
          setUser(response.user);
        } else {
          // If auth fails, check if it's a token issue
          console.error("Authentication failed:", response.error);

          if (response.error && (
            response.error.toLowerCase().includes('token') ||
            response.error.toLowerCase().includes('authorized') ||
            response.error.toLowerCase().includes('expire')
          )) {
            // Token is invalid or expired
            console.warn("Session expired or invalid token. Logging out...");
            localStorage.removeItem("token");
            window.location.href = "/login";
            return;
          }

          setError(response.error || "Failed to authenticate. Please check your connection.");
        }
      } catch (error: any) {
        console.error("Failed to fetch user", error);
        setError(error.message || "An unexpected error occurred while loading the dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast({ title: "Logged out", description: "See you soon!" });
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="glass-card p-8 max-w-md w-full text-center border-rose-500/20">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="btn-primary w-full py-3"
            >
              Retry Connection
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              className="btn-secondary w-full py-3"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <Navbar
        onLogout={handleLogout}
        userRole={getRoleFromToken() || user?.role}
        onTabChange={(tab) => {
          if (tab === 'roulette') {
            setShowRoulette(true);
            return;
          }
          const sectionId = tab === 'discover' ? 'discover-section' :
            tab === 'community' ? 'community-section' : null;
          if (sectionId) {
            setTimeout(() => {
              const element = document.getElementById(sectionId);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 100);
          }
        }}
      />

      <main className="relative pb-24 md:pb-0">
        <HeroSection onOpenRoulette={() => setShowRoulette(true)} />
        <div className="divider-gradient max-w-4xl mx-auto" />
        <div id="for-you-section">
          <PersonalizedSection />
        </div>
        <div id="discover-section">
          <DiscoverSection />
        </div>
        <MoodSection />
        <div id="community-section">
          <CommunitySection />
        </div>

        <div id="tours-section">
          <FoodTourSection />
        </div>
      </main>

      <AnimatePresence>
        {showRoulette && (
          <FoodRouletteSection onClose={() => setShowRoulette(false)} foodData={zaykaFoodData} />
        )}
      </AnimatePresence>

      <BottomNav onTabChange={(tab) => {
        if (tab === 'roulette') {
          setShowRoulette(true);
          return;
        }
        const sectionId = tab === 'discover' ? 'discover-section' :
          tab === 'community' ? 'community-section' :
            tab === 'profile' ? 'profile-section' : null;
        if (sectionId) {
          setTimeout(() => {
            const element = document.getElementById(sectionId);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
        } else if (tab === 'profile') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }} />

      <footer className="hidden md:block border-t border-white/[0.08] py-12 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg"><span className="text-lg">🍛</span></div>
              <div>
                <span className="font-display font-bold text-lg text-foreground">FoodYatra</span>
                <span className="block text-[10px] text-muted-foreground tracking-widest uppercase">Taste Explorer</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">© 2024 FoodYatra. Made with ❤️ in Vadodara</p>
          </div>
        </div>
      </footer>

      {/* Zayka AI Chatbot */}
      <ZaykaAIChat foodData={zaykaFoodData} />
    </div>
  );
};

export default Dashboard;
