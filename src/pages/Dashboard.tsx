
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
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<number | string | null>(null);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const response = await recommendationsApi.getMyRecommendations();
        if (response.success && response.data) {
          // Map backend data to FoodCard props
          const mappedData = (response.data as any[]).map((rec: any) => ({
            id: rec._id,
            name: rec.title,
            restaurant: 'FoodYatra Pick', // Subtitle
            area: rec.city,
            isVeg: rec.foodType === 'veg',
            priceRange: rec.budget === 'high' ? '500+' : rec.budget === 'medium' ? '200-500' : '50-200',
            rating: 5.0, // Admin picks are top tier
            badge: 'famous', // Reuse famous badge style
            image: rec.image
          }));
          setRecommendations(mappedData);
        }
      } catch (err) {
        console.error("Failed to fetch personalized recommendations", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  // if (!loading && recommendations.length === 0) return null; // Don't hide, show empty state

  return (
    <section className="py-20 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        <ScrollReveal>
          <div className="text-center mb-12">
            <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill mb-6 border-purple-500/20 bg-purple-500/5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-200">Handpicked for You</span>
            </motion.div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Personalized <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Recommendations</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Curated selections based on our expert choices and your taste profile.
            </p>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[28rem] rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 group/list">
            {recommendations.map((food, index) => (
              <ScrollReveal key={food.id} delay={index * 0.1}>
                <FoodCard
                  {...food}
                  onHover={() => setHoveredCard(food.id)}
                  onLeave={() => setHoveredCard(null)}
                  onClick={() => { }} // Simple view for now
                />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-card rounded-2xl border-dashed border-white/10">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-xl font-medium text-foreground">No recommendations yet</p>
            <p className="text-muted-foreground mt-2">Check back later for personalized picks!</p>
          </div>
        )}
      </div>
    </section>
  );
};

// --- DiscoverSection ---
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
  // Track which food IDs came from the DB (famousplace) vs static
  const [dbFoodIds, setDbFoodIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchFamousPlaces = async () => {
      try {
        const response = await famousPlaceApi.getAll();
        if (response.success && response.data) {
          // Transform backend data to FoodCard format
          const formattedData = (response.data as any[]).map((item: any) => {
            // Find best rated location or default to first
            const bestLocation = item.locations.reduce((prev: any, current: any) =>
              (current.rating > prev.rating) ? current : prev, item.locations[0] || {});

            return {
              id: item._id,
              name: item.dishName,
              restaurant: bestLocation.name || 'Unknown',
              area: bestLocation.area || item.city || 'Vadodara',
              isVeg: true, // Assuming default for now, can be enhanced
              priceRange: '50-150', // Placeholder
              rating: bestLocation.rating || 4.5,
              badge: 'famous',
              image: item.imageUrl,
              locations: item.locations // Store all locations
            };
          });
          setFamousFoodsData(formattedData);
          setDbFoodIds(new Set(formattedData.map((f: any) => String(f.id))));
        }
      } catch (error) {
        console.error("Failed to fetch famous places:", error);
      }
    };
    fetchFamousPlaces();
  }, []);

  // Combine static data for mapping
  const mapFoodPlaces = useMemo(() => {
    return [...famousFoodsData, ...famousRestaurantsArray, ...hiddenGems];
  }, [famousFoodsData]);

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
                placeholder="Search dishes, restaurants..."
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {famousFoodsData
                  .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.restaurant.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((food, index) => (
                    <ScrollReveal key={food.id} delay={index * 0.1}>
                      <FoodCard
                        {...food}
                        onClick={() => handleCardClick(food)}
                        onHover={() => setHoveredCard(food.id)}
                        onLeave={() => setHoveredCard(null)}
                      />
                    </ScrollReveal>
                  ))
                }
              </div>
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
              {/* Restaurant List (Right Column - Page Scroll) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {famousRestaurantsArray.map((restaurant, index) => (
                  <ScrollReveal key={restaurant.id} delay={index * 0.1}>
                    <FoodCard
                      {...restaurant}
                      onClick={() => navigate(`/place/${restaurant.id}?type=static`)}
                      onHover={() => setHoveredCard(restaurant.id)}
                      onLeave={() => setHoveredCard(null)}
                    />
                  </ScrollReveal>
                ))}
              </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {hiddenGems.map((food, index) => (
                  <ScrollReveal key={food.id} delay={index * 0.1}><FoodCard {...food} imageFit="contain" onClick={() => navigate(`/place/${food.id}?type=static`)} onHover={() => setHoveredCard(food.id)} onLeave={() => setHoveredCard(null)} /></ScrollReveal>
                ))}
              </div>
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

// --- CommunitySection ---
// --- CommunitySection ---
const CommunitySection = () => {
  const [posts, setPosts] = useState(mockPosts);
  const [newPostContent, setNewPostContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newPost = {
        _id: `post-${Date.now()}`,
        author: { name: 'You', avatar: mockUser.avatar }, // Using mockUser from top scope
        content: newPostContent,
        image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop', // Placeholder image
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
        tags: ['New', 'Foodie']
      };
      setPosts([newPost, ...posts]);
      setNewPostContent('');
      setIsLoading(false);
      toast({ title: "Post published!", description: "Your food adventure is live." });
    }, 1000);
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post._id === postId) {
        const isLiked = post.likes.includes('user-1'); // Assuming 'user-1' is current user
        return {
          ...post,
          likes: isLiked ? post.likes.filter(id => id !== 'user-1') : [...post.likes, 'user-1']
        };
      }
      return post;
    }));
  };

  return (
    <section className="py-20 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      <div className="max-w-3xl mx-auto relative z-10">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill mb-6"><Users className="w-4 h-4 text-primary" /><span className="text-sm font-medium">Foodie Community</span></div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Share Your <span className="gradient-text">Journey</span></h2>
            <p className="text-muted-foreground text-lg text-center max-w-xl mx-auto">Connect with fellow food lovers, share your discoveries, and get inspired.</p>
          </div>
        </ScrollReveal>

        <div className="mb-12">
          <div className="glass-card p-6">
            <form onSubmit={handleCreatePost}>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent shrink-0 flex items-center justify-center text-lg font-bold text-white">Y</div>
                <div className="flex-1">
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="What's delicious today?"
                    className="w-full bg-transparent border-none focus:ring-0 resize-none h-24 text-lg placeholder:text-muted-foreground/50 p-0"
                  />
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex gap-2">
                      <button type="button" className="p-2 rounded-full hover:bg-white/5 text-muted-foreground hover:text-primary transition-colors"><Image className="w-5 h-5" /></button>
                      <button type="button" className="p-2 rounded-full hover:bg-white/5 text-muted-foreground hover:text-primary transition-colors"><MapPin className="w-5 h-5" /></button>
                      <button type="button" className="p-2 rounded-full hover:bg-white/5 text-muted-foreground hover:text-primary transition-colors"><Hash className="w-5 h-5" /></button>
                    </div>
                    <button type="submit" disabled={!newPostContent.trim() || isLoading} className="btn-primary px-6 py-2 h-auto text-sm">
                      {isLoading ? 'Posting...' : 'Post'} <Send className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          {posts.map((post, index) => (
            <ScrollReveal key={post._id} delay={index * 0.1}>
              <motion.div className="glass-card p-6 md:p-8 hover:border-primary/20 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img src={post.author.avatar || 'https://via.placeholder.com/40'} alt={post.author.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20" />
                    <div>
                      <h3 className="font-semibold text-foreground">{post.author.name}</h3>
                      <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <button className="p-2 rounded-full hover:bg-white/5 text-muted-foreground"><MoreHorizontal className="w-5 h-5" /></button>
                </div>
                <p className="text-foreground/90 mb-4 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                {post.image && (
                  <div className="mb-4 rounded-xl overflow-hidden aspect-video relative group">
                    <img src={post.image} alt="Post content" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                )}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-md">#{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors ${post.likes.includes('user-1') ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'}`}
                    >
                      <Heart className={`w-5 h-5 ${post.likes.includes('user-1') ? 'fill-current' : ''}`} />
                      <span>{post.likes.length}</span>
                    </button>
                    <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span>{post.comments.length}</span>
                    </button>
                    <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                  <button className="p-2 rounded-full hover:bg-white/5 text-muted-foreground hover:text-foreground"><Bookmark className="w-5 h-5" /></button>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- FoodRouletteSection ---
// --- FoodRouletteSection ---
// --- FoodRouletteSection ---
// --- FoodRouletteSection ---
const FoodRouletteSection = ({ onClose }: { onClose: () => void }) => {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<any | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Animation Controls
  const animationControls = useRef<any>(null);
  const rotation = useMotionValue(0);
  const [displayRotation, setDisplayRotation] = useState(0);

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update display rotation for rendering
  useMotionValueEvent(rotation, "change", (latest) => {
    setDisplayRotation(latest);
  });

  const calculateWinner = (finalRotation: number) => {
    const normalizedRotation = finalRotation % 360;
    const segmentSize = 360 / famousRestaurantsArray.length;

    // Calculate index based on reverse rotation logic (carousel moves left)
    const winningIndex = Math.round((360 - normalizedRotation) / segmentSize) % famousRestaurantsArray.length;
    const actualIndex = (winningIndex + famousRestaurantsArray.length) % famousRestaurantsArray.length;

    setWinner(famousRestaurantsArray[actualIndex]);
    setSpinning(false);
  };

  const handleSpin = async () => {
    if (spinning) return;
    setSpinning(true);
    setWinner(null);
    setDisplayRotation(0);

    // Start from current rotation to avoid jumps
    const startRot = rotation.get();

    // Animate indefinitely
    animationControls.current = animate(rotation, startRot + 360, {
      duration: 0.5, // Fast spin
      ease: "linear",
      repeat: Infinity,
      onUpdate: (latest) => {
        // Optional: Reset rotation value periodically to avoid huge numbers if needed, 
        // but simple 360 loop is fine for visual if we don't care about the number growing.
        // Actually, for infinite spin, simply adding 360 repeatedly is smoothest.
      }
    });
  };

  const handleStop = () => {
    if (!spinning || !animationControls.current) return;

    // 1. Instant Stop
    animationControls.current.stop();

    // 2. Immediately calculate winner from current frozen position
    const currentRot = rotation.get();
    calculateWinner(currentRot);
  };

  // 3D Carousel Parameters
  const itemCount = famousRestaurantsArray.length;
  const radius = isMobile ? 140 : 280; // Distance from center
  const cardWidth = isMobile ? 160 : 220;
  const cardHeight = isMobile ? 120 : 160;
  const anglePerItem = 360 / itemCount;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      <button onClick={onClose} className="absolute top-8 right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-[110]">
        <X className="w-6 h-6" />
      </button>
      <section className="relative w-full max-w-7xl mx-auto px-4 overflow-hidden flex flex-col justify-center h-full">
        {/* Cinematic Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900/50 via-background to-background pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 w-full perspective-container">
          <ScrollReveal>
            <div className="mb-16 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill mb-4 border border-primary/20 bg-primary/5">
                <Dices className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm font-semibold tracking-wide text-primary">DESTINY AWAITS</span>
              </div>
              <h2 className="font-display text-4xl md:text-6xl font-bold mb-4 tracking-tight">
                Food <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Roulette</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto font-light">
                Don't know what to eat? Let our AI-powered randomness decide for you.
              </p>
            </div>
          </ScrollReveal>

          {/* 3D Stage */}
          <div className="relative h-[400px] md:h-[500px] flex items-center justify-center perspective-[1200px] group">

            {/* Spotlight Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

            {/* Carousel Container */}
            <motion.div
              style={{
                rotateY: isMobile ? 0 : rotation, // Horizontal spin on desktop
                rotateX: isMobile ? rotation : 0, // Vertical spin on mobile
                transformStyle: "preserve-3d"
              }}
              className="relative w-0 h-0 flex items-center justify-center"
            >
              {famousRestaurantsArray.map((item, index) => {
                const itemAngle = index * anglePerItem;
                return (
                  <motion.div
                    key={item.id}
                    style={{
                      transform: isMobile
                        ? `rotateX(${itemAngle}deg) translateZ(${radius}px)`
                        : `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                      width: cardWidth,
                      height: cardHeight,
                      backfaceVisibility: "hidden",
                    }}
                    className="absolute -ml-[calc(var(--width)/2)] -mt-[calc(var(--height)/2)] rounded-xl overflow-hidden glass-card shadow-2xl border border-white/10"
                  >
                    <div className="relative w-full h-full p-1 bg-white/5">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg brightness-75 group-hover:brightness-100 transition-all duration-500"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent text-white">
                        <p className="text-xs font-bold truncate text-primary">{item.name}</p>
                        <p className="text-[10px] text-white/70 truncate">{item.restaurant}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Selection Ring / Focus Frame */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[180px] md:w-[260px] md:h-[200px] pointer-events-none z-20">
              <div className={`w-full h-full rounded-2xl border-2 border-primary/50 shadow-[0_0_30px_rgba(var(--primary),0.3)] transition-opacity duration-300 ${spinning ? 'opacity-100 scale-105' : 'opacity-30'}`} />
              {!isMobile && <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-b-[15px] border-b-primary border-r-[10px] border-r-transparent" />}
              {isMobile && <div className="absolute top-1/2 -right-8 -translate-y-1/2 w-0 h-0 border-t-[10px] border-t-transparent border-r-[15px] border-r-primary border-b-[10px] border-b-transparent" />}
            </div>

            {/* Controls: Spin & Stop */}
            <div className="absolute bottom-[-60px] md:bottom-[-80px] left-1/2 -translate-x-1/2 z-30 flex gap-4">

              {!spinning ? (
                <motion.button
                  whileHover={{ scale: 1.05, transition: SPRING_HOVER }}
                  whileTap={{ scale: 0.95, transition: SPRING_TAP }}
                  onClick={handleSpin}
                  className="relative group overflow-hidden px-8 py-4 rounded-full bg-gradient-to-r from-primary to-orange-500 text-white font-bold tracking-widest uppercase shadow-[0_10px_40px_-10px_rgba(var(--primary),0.5)] border border-white/20"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Spin Roulette <Sparkles className="w-4 h-4" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
              ) : (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 50, 50, 0.4)", transition: SPRING_HOVER }}
                  whileTap={{ scale: 0.95, transition: SPRING_TAP }}
                  onClick={handleStop}
                  className="px-8 py-4 rounded-full bg-black/40 backdrop-blur-md border border-red-500/50 text-red-100 font-bold tracking-widest uppercase shadow-premium hover:shadow-[0_0_20px_rgba(255,0,0,0.3)] transition-all flex items-center gap-2"
                >
                  <span>STOP</span>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </motion.button>
              )}

            </div>

          </div>

          {/* Winner Reveal Overlay (Same as before) */}
          <AnimatePresence>
            {winner && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={SPRING_ENTRY}
                className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm rounded-3xl"
              >
                <div className="relative bg-card border border-primary/30 p-1 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/40 blur-[80px] rounded-full pointer-events-none" />

                  <div className="relative bg-background/90 rounded-[20px] overflow-hidden">
                    <div className="h-48 overflow-hidden relative">
                      <img src={winner.image} alt={winner.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1 block">Winner!</span>
                        <h3 className="text-xl font-bold text-white leading-tight">{winner.name}</h3>
                      </div>
                    </div>

                    <div className="p-5 text-center space-y-4">
                      <div>
                        <p className="text-gray-400 text-sm mb-1">{winner.restaurant}</p>
                        <div className="flex items-center justify-center gap-2 text-xs font-medium text-gray-500">
                          <span>{winner.area}</span>
                          <span>•</span>
                          <span className="text-amber-500 flex items-center gap-1"><Star className="w-3 h-3 fill-amber-500" /> {winner.rating}</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setWinner(null)}
                          className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors"
                        >
                          Close
                        </button>
                        <button
                          onClick={() => window.open(winner.mapUrl, '_blank')}
                          className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/25 hover:brightness-110 transition-all"
                        >
                          Go There
                        </button>
                      </div>
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
              isVeg: true,
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
            console.log("Session expired or invalid token. Logging out...");
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

  console.log("Rendering Dashboard. Loading:", loading, "Error:", error, "User:", user);

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
          <FoodRouletteSection onClose={() => setShowRoulette(false)} />
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
