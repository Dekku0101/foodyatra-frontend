import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SPRING_ENTRY } from '@/motion/motionPresets';
import { toursApi, paymentsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Calendar, Clock, Utensils, IndianRupee, Search, Star, Info, Loader2, ArrowRight, CheckCircle, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Tours = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');

  // Payment state
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null); // Booking ID

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      try {
        const response = await toursApi.getAllTours(city ? { city } : undefined);
        if (response.success && response.data) {
          setTours(response.data as any[]);
        }
      } catch (error) {
        console.error("Failed to fetch tours", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchTours, 500);
    return () => clearTimeout(debounceTimer);
  }, [city]);

  const handlePay = async (tour: any) => {
    setProcessingId(tour._id);
    try {
      // Simulate processing time for UX
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await paymentsApi.createSession(tour._id);

      if (response.success) {
        setBookingSuccess(response.data?.bookingId || 'confirmed');
        toast({
          title: "Booking Confirmed! 🎉",
          description: `You paid ₹${response.amountPaid} for ${tour.title}.`,
          duration: 5000,
        });
      } else {
        toast({
          title: "Payment Failed",
          description: response.message || "Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="fixed inset-0 neural-bg -z-10" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 px-4 py-4 backdrop-blur-md bg-background/50 border-b border-border/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.button
            whileHover={{ x: -2 }}
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Dashboard
          </motion.button>
          <h1 className="font-display font-bold text-xl">City Food Tours</h1>
          <div className="w-8" />
        </div>
      </nav>

      <main className="pt-8 px-4 max-w-7xl mx-auto">
        {/* Hero / Filter Section */}
        <div className="mb-12 text-center max-w-2xl mx-auto space-y-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-3">
              Explore <span className="gradient-text">Culinary Journeys</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Guided food tours to discover the best local flavors and hidden gems.
            </p>
          </div>

          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Search tours by city..."
              className="pl-9 h-12 rounded-xl bg-secondary/50 border-white/10 focus:border-primary/50 transition-all font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-20 bg-secondary/20 rounded-3xl glass-card">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No tours found via search</h3>
            <p className="text-muted-foreground">Try searching for a different city or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {tours.map((tour, index) => (
                <motion.div
                  key={tour._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...SPRING_ENTRY, delay: index * 0.1 }}
                  className="glass-card overflow-hidden flex flex-col group h-full"
                >
                  {/* Image Section */}
                  <div className="h-56 relative overflow-hidden">
                    <img
                      src={tour.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"}
                      alt={tour.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      {tour.isAdminFeatured && (
                        <span className="bg-primary/90 text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1 shadow-lg">
                          <Star className="w-3 h-3 fill-current" /> Featured
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <div>
                        <h3 className="font-display font-bold text-xl text-white mb-1 leading-snug">{tour.title}</h3>
                        <div className="flex items-center gap-2 text-white/90 text-sm">
                          <MapPin className="w-3.5 h-3.5" /> {tour.city}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex-1 flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                        <Clock className="w-4 h-4 text-accent" />
                        <span className="font-medium">{tour.duration || '3 hours'}</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-medium">{new Date(tour.date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                      {tour.description}
                    </p>

                    {tour.includes && tour.includes.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Includes</div>
                        <div className="flex flex-wrap gap-2">
                          {tour.includes.map((item: string, i: number) => (
                            <span key={i} className="text-xs px-2 py-1 bg-secondary rounded-md text-foreground/80 flex items-center gap-1">
                              <Utensils className="w-3 h-3 opacity-50" /> {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Price / Person</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold text-foreground">₹{tour.price}</span>
                        </div>
                      </div>

                      {bookingSuccess ? (
                        <Button disabled className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20">
                          <CheckCircle className="w-4 h-4 mr-2" /> Booked
                        </Button>
                      ) : (
                        <Button
                          className="px-6 shadow-lg shadow-primary/20"
                          onClick={() => handlePay(tour)}
                          disabled={!!processingId}
                        >
                          {processingId === tour._id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
                            </>
                          ) : (
                            <>
                              Book Now <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default Tours;
