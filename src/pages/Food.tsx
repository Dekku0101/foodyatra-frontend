import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, MapPin, Heart, Loader2, Search, Sparkles, Filter, 
  Scale, X, Check, Utensils, RotateCcw 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { foodPlacesApi, aiApi, userJourneyApi } from '@/lib/api';
import Navbar from "@/components/Navbar";
import CompareModal from '@/components/CompareModal';
import { useToast } from '@/hooks/use-toast';

const AREAS = [
  'All', 'Alkapuri', 'Akota', 'Bhayli', 'Gotri', 'Sevasi', 'Gorwa', 
  'Subhanpura', 'Diwalipura', 'Fatehgunj', 'Raopura', 'Sayajigunj', 'Manjalpur', 'Karelibaug'
];
const FOOD_TYPES = ['All', 'restaurant', 'street food', 'cafe'];
const DIETARY = ['All', 'veg', 'non-veg'];
const PRICE_TIERS = [
  { id: 'all', label: 'All Prices' },
  { id: 'low', label: 'Under ₹200' },
  { id: 'medium', label: '₹200 - ₹500' },
  { id: 'high', label: '₹500+' },
];

const Food = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [foodPlaces, setFoodPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiExtractedParams, setAiExtractedParams] = useState<any | null>(null);

  // Filters state
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedFoodType, setSelectedFoodType] = useState('All');
  const [selectedDietary, setSelectedDietary] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedMinRating, setSelectedMinRating] = useState<number | null>(null);

  // Comparison state
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    fetchFoodPlaces();
  }, [selectedArea, selectedFoodType, selectedDietary, selectedPrice, selectedMinRating, searchQuery]);

  const fetchFoodPlaces = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchQuery.trim()) params.dish = searchQuery.trim();
      if (selectedArea !== 'All') params.area = selectedArea;
      if (selectedFoodType !== 'All') params.foodType = selectedFoodType;
      if (selectedDietary === 'veg') params.isVeg = 'true';
      if (selectedDietary === 'non-veg') params.isVeg = 'false';
      if (selectedPrice !== 'all') params.price = selectedPrice;
      if (selectedMinRating) params.minRating = selectedMinRating;

      const res = await foodPlacesApi.getAllFoodPlaces(params);
      if (res.success && res.data) {
        setFoodPlaces(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch food places:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAiNaturalLanguageSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsAiSearching(true);

    try {
      const res = await aiApi.parseFoodQuery(searchQuery);
      if (res.success && res.extracted) {
        const ext = res.extracted;
        setAiExtractedParams(ext);

        // Apply extracted parameters
        if (ext.dietary === 'veg') setSelectedDietary('veg');
        else if (ext.dietary === 'non-veg') setSelectedDietary('non-veg');

        if (ext.location) {
          const matchedArea = AREAS.find(a => a.toLowerCase().includes(ext.location.toLowerCase()));
          if (matchedArea) setSelectedArea(matchedArea);
        }

        if (ext.budget === 'budget') setSelectedPrice('low');
        else if (ext.budget === 'moderate') setSelectedPrice('medium');
        else if (ext.budget === 'expensive') setSelectedPrice('high');

        if (ext.foodType) {
          const matchedType = FOOD_TYPES.find(t => t.toLowerCase().includes(ext.foodType.toLowerCase()));
          if (matchedType) setSelectedFoodType(matchedType);
        }

        toast({
          title: "AI Search Filter Applied",
          description: `Filtered by ${ext.dietary !== 'any' ? ext.dietary : ''} ${ext.cuisine || ''} ${ext.location || ''} ${ext.budget || ''}`.trim()
        });
      }
    } catch {
      toast({
        title: "Search Error",
        description: "Could not parse query. Using standard text search instead.",
        variant: "destructive"
      });
    } finally {
      setIsAiSearching(false);
    }
  };

  const resetFilters = () => {
    setSelectedArea('All');
    setSelectedFoodType('All');
    setSelectedDietary('All');
    setSelectedPrice('all');
    setSelectedMinRating(null);
    setSearchQuery('');
    setAiExtractedParams(null);
  };

  const toggleFavorite = async (place: any) => {
    try {
      const res = await userJourneyApi.toggleFavorite({
        placeId: place._id || place.id,
        placeType: 'foodplace',
        name: place.name,
        image: place.image,
        cuisine: place.cuisine || place.category,
        isVeg: place.isVeg,
        price: place.averagePrice,
        rating: place.rating,
        area: place.area
      });

      if (res.success) {
        toast({
          title: res.isFavorited ? "Saved to Favorites" : "Removed from Favorites",
          description: `${place.name} updated in your Food Journey passport.`
        });
      }
    } catch {
      toast({
        title: "Login Required",
        description: "Please log in to save favorites to your profile.",
        variant: "destructive"
      });
    }
  };

  const toggleCompare = (id: string) => {
    if (compareIds.includes(id)) {
      setCompareIds(prev => prev.filter(item => item !== id));
    } else {
      if (compareIds.length >= 3) {
        toast({
          title: "Max Limit Reached",
          description: "You can compare up to 3 food places simultaneously.",
          variant: "destructive"
        });
        return;
      }
      setCompareIds(prev => [...prev, id]);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary via-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg">
                <Utensils className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">Vadodara Food Directory</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1 ml-13">
              Discover authentic eateries, legendary stalls, and hidden cafes across the city
            </p>
          </div>

          {compareIds.length > 0 && (
            <div className="flex items-center gap-3 bg-primary/10 border border-primary/30 px-4 py-2 rounded-2xl shadow-sm">
              <Scale className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-foreground">
                {compareIds.length} place(s) selected
              </span>
              <button
                onClick={() => setIsCompareModalOpen(true)}
                disabled={compareIds.length < 2}
                className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-colors disabled:opacity-50"
              >
                Compare ({compareIds.length})
              </button>
            </div>
          )}
        </div>

        {/* 1. Smart Search & Natural Language Bar */}
        <div className="space-y-3">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-muted-foreground absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiNaturalLanguageSearch()}
              placeholder="Try searching e.g. 'Best Gujarati breakfast in Alkapuri under ₹200' or 'Spicy Sev Usal'..."
              className="w-full bg-card border border-white/15 focus:border-primary/60 rounded-2xl pl-12 pr-32 py-3.5 text-sm focus:outline-none transition-all placeholder:text-muted-foreground/60 text-foreground shadow-sm"
            />
            <button
              onClick={handleAiNaturalLanguageSearch}
              disabled={!searchQuery.trim() || isAiSearching}
              className="absolute right-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-orange-500 hover:brightness-110 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              {isAiSearching ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>AI Search</span>
            </button>
          </div>

          {/* AI Extracted Parameters Pill */}
          {aiExtractedParams && (
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                <span className="font-semibold text-primary">AI Filter Applied:</span>
                <span className="text-foreground/90">
                  {aiExtractedParams.dietary !== 'any' ? `[${aiExtractedParams.dietary}] ` : ''}
                  {aiExtractedParams.cuisine ? `${aiExtractedParams.cuisine} • ` : ''}
                  {aiExtractedParams.location ? `in ${aiExtractedParams.location} • ` : ''}
                  {aiExtractedParams.budget ? `budget: ${aiExtractedParams.budget}` : ''}
                </span>
              </div>
              <button
                onClick={resetFilters}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 shrink-0 font-medium"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
          )}
        </div>

        {/* 2. Multi-Filter Category Pills */}
        <div className="space-y-4 p-5 rounded-3xl bg-card border border-white/10 shadow-sm">
          {/* Areas Filter */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
            <span className="text-xs font-semibold text-muted-foreground shrink-0 mr-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-primary" /> Area:
            </span>
            {AREAS.map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
                  selectedArea === area
                    ? 'bg-primary text-primary-foreground font-bold shadow'
                    : 'bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground border border-white/5'
                }`}
              >
                {area}
              </button>
            ))}
          </div>

          {/* Food Type & Dietary & Price Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground mr-1">Type:</span>
              {FOOD_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedFoodType(type)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                    selectedFoodType === type
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 font-bold'
                      : 'bg-white/5 hover:bg-white/10 text-muted-foreground border border-white/5'
                  }`}
                >
                  {type}
                </button>
              ))}

              <span className="text-xs font-semibold text-muted-foreground ml-3 mr-1">Diet:</span>
              {DIETARY.map((diet) => (
                <button
                  key={diet}
                  onClick={() => setSelectedDietary(diet)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                    selectedDietary === diet
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                      : 'bg-white/5 hover:bg-white/10 text-muted-foreground border border-white/5'
                  }`}
                >
                  {diet === 'veg' ? 'Pure Veg' : diet === 'non-veg' ? 'Non-Veg' : 'All'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {PRICE_TIERS.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedPrice(tier.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedPrice === tier.id
                      ? 'bg-white/20 text-white border border-white/30 font-bold'
                      : 'bg-white/5 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Food Places Grid */}
        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm">Fetching Vadodara food places...</p>
            </div>
          ) : foodPlaces.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {foodPlaces.map((place) => {
                const isCompared = compareIds.includes(place._id);

                return (
                  <motion.div
                    key={place._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl border border-white/10 bg-card overflow-hidden shadow-lg hover:border-primary/50 transition-all flex flex-col justify-between group"
                  >
                    {/* Image Header */}
                    <div className="relative h-44 w-full overflow-hidden bg-black/40">
                      <img
                        src={place.image || '/images/SevUsal.png'}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/SevUsal.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                      {/* Top Action Buttons */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className={`w-4 h-4 rounded-sm flex items-center justify-center border ${place.isVeg ? 'border-emerald-500 bg-emerald-950/80' : 'border-rose-500 bg-rose-950/80'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${place.isVeg ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleCompare(place._id)}
                            className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${
                              isCompared
                                ? 'bg-primary text-white shadow'
                                : 'bg-black/60 text-white/80 hover:text-white'
                            }`}
                            title={isCompared ? 'Remove from compare' : 'Add to compare'}
                          >
                            <Scale className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleFavorite(place)}
                            className="p-1.5 rounded-full bg-black/60 text-white/80 hover:text-rose-400 backdrop-blur-md transition-colors"
                            title="Save favorite"
                          >
                            <Heart className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Rating & Price */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          {Number(place.rating || 4.2).toFixed(1)}
                        </div>
                        <span className="text-xs font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                          ₹{place.averagePrice || 200} for two
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {place.name}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 line-clamp-1">
                          <MapPin className="w-3 h-3 text-primary shrink-0" />
                          {place.area || place.city || 'Vadodara'}
                        </p>
                        {place.famousDish && (
                          <p className="text-xs text-foreground/80 mt-2 font-medium line-clamp-1">
                            <span className="text-primary font-semibold">Specialty:</span> {place.famousDish}
                          </p>
                        )}
                      </div>

                      {/* Card Footer Button */}
                      <button
                        onClick={() => navigate(`/place/${place._id}`)}
                        className="w-full py-2 rounded-xl bg-white/5 hover:bg-primary hover:text-primary-foreground text-xs font-bold text-foreground border border-white/10 transition-all"
                      >
                        View Details & Menu
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-3xl border border-white/10 space-y-3">
              <Utensils className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <p className="text-lg font-bold">No food places found</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No eateries match your selected filters. Try broadening your criteria or reset filters.
              </p>
              <button
                onClick={resetFilters}
                className="mt-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Comparison Modal */}
      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        selectedPlaceIds={compareIds}
        onRemovePlace={(id) => setCompareIds(prev => prev.filter(item => item !== id))}
      />
    </div>
  );
};

export default Food;
