import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toursApi } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, Search, Star, Loader2, ArrowRight, 
  Sparkles, Compass, Users, CheckCircle, Flame, Moon, Leaf, Coffee, Heart 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TourCard, { Tour } from '@/components/TourCard';
import TourModal from '@/components/TourModal';

const CATEGORIES = [
  { id: 'all', label: 'All Tours', icon: Compass },
  { id: 'Heritage Walk', label: 'Heritage Walks', icon: Sparkles },
  { id: 'Night Food', label: 'Night Food', icon: Moon },
  { id: 'Gujarati Cuisine', label: 'Gujarati Cuisine', icon: Leaf },
  { id: 'Cafe Trail', label: 'Cafe Trails', icon: Coffee },
  { id: 'Sweet Trail', label: 'Sweet Trails', icon: Heart },
  { id: 'Vegetarian', label: 'Satvik / Veg', icon: Leaf }
];

const Tours = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Selected tour for interactive booking modal
  const [selectedTourForBooking, setSelectedTourForBooking] = useState<Tour | null>(null);

  const fetchTours = async () => {
    setLoading(true);
    try {
      const response = await toursApi.getAllTours();
      if (response.success && response.data) {
        setTours(response.data as Tour[]);
      }
    } catch (error) {
      console.error("Failed to fetch tours", error);
      toast({
        title: "Could not load tours",
        description: "Please check if your backend server is active.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  // Filter tours by category and search query
  const filteredTours = useMemo(() => {
    return tours.filter(tour => {
      const matchesCat = selectedCategory === 'all' || tour.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        tour.title.toLowerCase().includes(q) || 
        tour.city.toLowerCase().includes(q) || 
        (tour.description && tour.description.toLowerCase().includes(q)) ||
        (tour.category && tour.category.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [tours, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen pb-24 bg-background text-foreground relative">
      <div className="fixed inset-0 neural-bg -z-10" />

      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 px-4 py-4 backdrop-blur-xl bg-background/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.button
            whileHover={{ x: -2 }}
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Dashboard
          </motion.button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white shadow-md">
              <Compass className="w-4 h-4" />
            </div>
            <h1 className="font-display font-bold text-lg sm:text-xl">Guided Food Walks</h1>
          </div>
          <div className="w-16" />
        </div>
      </nav>

      <main className="pt-8 px-4 max-w-7xl mx-auto space-y-10">
        {/* Hero Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Curated Gastronomic Experiences
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tight leading-tight">
            Explore Vadodara's <span className="gradient-text">Food Walking Tours</span>
          </h2>

          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Taste century-old heritage recipes, sizzling night markets, and royal Gaekwad delicacies guided by passionate local culinary storytellers.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto pt-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tours by name, cuisine, area..."
              className="pl-11 h-12 rounded-2xl bg-card/80 border-white/15 focus:border-primary/60 transition-all font-medium shadow-inner placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Category Filter Pills Row */}
        <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 scroll-smooth">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-primary to-orange-500 text-white shadow-lg shadow-primary/25 scale-105'
                    : 'bg-card/70 hover:bg-white/10 text-muted-foreground hover:text-foreground border border-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tours Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Fetching culinary itineraries...</p>
          </div>
        ) : filteredTours.length === 0 ? (
          <div className="text-center py-20 bg-card/40 rounded-3xl border border-dashed border-white/15 max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-muted-foreground">
              <Compass className="w-8 h-8 opacity-60" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-display text-foreground">No matching food tours found</h3>
              <p className="text-muted-foreground text-sm mt-1">Try selecting a different category or clearing your search term.</p>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-primary text-black font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredTours.map((tour) => (
                <TourCard
                  key={tour._id}
                  tour={tour}
                  onViewDetails={() => navigate(`/place/${tour._id}?type=tour`)}
                  onBookNow={() => setSelectedTourForBooking(tour)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Interactive Tour Booking Modal */}
      {selectedTourForBooking && (
        <TourModal
          isOpen={!!selectedTourForBooking}
          onClose={() => setSelectedTourForBooking(null)}
          tour={selectedTourForBooking}
        />
      )}
    </div>
  );
};

export default Tours;
