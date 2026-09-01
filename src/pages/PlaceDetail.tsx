import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  MapPin,
  IndianRupee,
  Leaf,
  Clock,
  Users,
  ChefHat,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Footprints,
  Calendar,
  ShieldCheck,
  Package,
  HelpCircle,
  Navigation
} from 'lucide-react';
import { foodPlacesApi, famousPlaceApi, toursApi, paymentsApi } from '@/lib/api';
import { staticPlacesMap } from '@/data/mockData';
import PlaceMap from '@/components/PlaceMap';
import TourModal from '@/components/TourModal';
import { SPRING_ENTRY } from '@/motion/motionPresets';
import { getTourCategoryMeta } from '@/components/TourCard';
import { useToast } from '@/hooks/use-toast';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const normalize = (raw: any, type: string): any | null => {
  if (!raw) return null;

  if (type === 'static' || type === 'foodplace') {
    return {
      _type: type,
      name: raw.name,
      image: raw.image || raw.imageUrl,
      description: raw.description || `${raw.name} at ${raw.area || raw.city}`,
      area: raw.area || raw.city,
      city: raw.city,
      address: raw.address,
      rating: raw.rating,
      isVeg: raw.isVeg,
      priceRange: raw.priceRange || (raw.averagePrice ? `${raw.averagePrice}` : null),
      famousDish: raw.famousDish,
      lat: raw.lat ?? raw.latitude,
      lng: raw.lng ?? raw.longitude,
      menu: raw.menu || [],
      isTour: false,
    };
  }

  if (type === 'famousplace') {
    const bestLoc =
      (raw.locations ?? []).reduce(
        (best: any, cur: any) => (cur.rating > (best?.rating ?? 0) ? cur : best),
        raw.locations?.[0] ?? {}
      );
    const rawIsVeg = raw.isVeg !== undefined
      ? Boolean(raw.isVeg)
      : (() => {
          const text = [raw.dishName, ...(raw.tags ?? [])].join(' ').toLowerCase();
          return !(
            text.includes('chicken') || text.includes('mutton') || text.includes('fish') ||
            text.includes('seafood') || text.includes('kebab') || text.includes('non-veg') ||
            text.includes('tandoori') || text.includes('egg')
          );
        })();
    return {
      _type: type,
      name: raw.dishName,
      image: raw.imageUrl || bestLoc?.imageUrl,
      description:
        raw.description ||
        `${raw.dishName} is one of the most beloved dishes you can find in ${bestLoc?.city || 'Vadodara'}.`,
      area: bestLoc?.area || bestLoc?.city || 'Vadodara',
      city: bestLoc?.city || 'Vadodara',
      address: bestLoc?.address,
      rating: bestLoc?.rating || 4.5,
      isVeg: rawIsVeg,
      priceRange: null,
      lat: bestLoc?.latitude,
      lng: bestLoc?.longitude,
      menu: bestLoc?.menu || [],
      locations: raw.locations || [],
      isTour: false,
    };
  }

  if (type === 'tour') {
    return {
      _type: type,
      _id: raw._id,
      name: raw.title,
      title: raw.title,
      image: raw.image,
      category: raw.category || 'Heritage Walk',
      description: raw.description,
      city: raw.city || 'Vadodara',
      rating: raw.rating || 4.8,
      isVeg: raw.category === 'Vegetarian' ? true : null,
      price: raw.price,
      duration: raw.duration || '3 Hours',
      distance: raw.distance || '1.8 km',
      difficulty: raw.difficulty || 'Easy Walking',
      meetingPoint: raw.meetingPoint || 'Vadodara City Center',
      stops: raw.stops || [],
      includes: raw.includes || [],
      whatToBring: raw.whatToBring || [],
      rules: raw.rules || [],
      cancellationPolicy: raw.cancellationPolicy || 'Free cancellation up to 24h prior to departure',
      slots: raw.slots || [],
      menu: [],
      isTour: true,
    };
  }

  return null;
};

// ─────────────────────────────────────────────
// Menu Item Card
// ─────────────────────────────────────────────
const MenuItemCard = ({ item }: { item: { itemName: string; price?: number; description?: string } }) => (
  <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
    <div className="min-w-0">
      <p className="font-semibold text-white text-sm">{item.itemName}</p>
      {item.description && (
        <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{item.description}</p>
      )}
    </div>
    {item.price != null && (
      <div className="flex items-center gap-0.5 text-primary font-bold text-sm shrink-0">
        <IndianRupee className="w-3.5 h-3.5" />
        {item.price}
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────
// PlaceDetail Page
// ─────────────────────────────────────────────
const PlaceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'static';
  const navigate = useNavigate();
  const { toast } = useToast();

  const [place, setPlace] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        if (type === 'static') {
          const staticEntry = staticPlacesMap[id] ?? staticPlacesMap[Number(id)];
          if (!staticEntry) throw new Error('Place not found');
          setPlace(normalize(staticEntry, 'static'));
          return;
        }

        const isValidObjectId = /^[a-f\d]{24}$/i.test(id);
        if (!isValidObjectId) {
          throw new Error('This place does not have a detail page yet.');
        }

        if (type === 'foodplace') {
          const res = await foodPlacesApi.getFoodPlaceById(id);
          if (!res.success || !res.data) throw new Error('Food place not found');
          setPlace(normalize(res.data, 'foodplace'));
          return;
        }

        if (type === 'famousplace') {
          const res = await famousPlaceApi.getById(id);
          if (!res.success || !res.data) throw new Error('Famous place not found');
          setPlace(normalize(res.data, 'famousplace'));
          return;
        }

        if (type === 'tour') {
          const res = await toursApi.getTourById(id);
          if (!res.success || !res.data) throw new Error('Tour not found');
          setPlace(normalize(res.data, 'tour'));
          return;
        }

        throw new Error('Unknown place type');
      } catch (err: any) {
        setError(err.message || 'Failed to load place');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, type]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-xl font-medium text-white">Could not load this place</p>
        <p className="text-muted-foreground text-sm">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 rounded-full bg-primary text-black font-bold text-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  const categoryMeta = place.isTour ? getTourCategoryMeta(place.category) : null;
  const CategoryIcon = categoryMeta?.icon;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Hero Image Section */}
      <div className="relative w-full h-[52vh] min-h-[340px] overflow-hidden bg-black/60">
        {place.image ? (
          <img
            src={place.image}
            alt={place.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/SevUsal.png';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/30" />

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={SPRING_ENTRY}
          onClick={() => navigate(-1)}
          className="absolute top-6 left-4 md:left-8 flex items-center gap-2 px-4 py-2 rounded-full bg-black/70 border border-white/15 backdrop-blur-md text-white text-sm font-medium hover:bg-black/90 transition-colors z-20 shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>
      </div>

      {/* Content Container */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-24 relative z-10 space-y-10">
        
        {/* Title & Metadata Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING_ENTRY}
          className="glass-card rounded-3xl p-6 sm:p-8 border border-white/15 bg-card/90 shadow-2xl space-y-4"
        >
          {/* Tag Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {place.isTour && categoryMeta && (
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-md border flex items-center gap-1.5 shadow-sm ${categoryMeta.badgeStyle}`}>
                {CategoryIcon && <CategoryIcon className="w-3.5 h-3.5" />}
                {categoryMeta.label}
              </span>
            )}

            {place.isVeg === true && (
              <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <Leaf className="w-3 h-3" /> Pure Veg
              </span>
            )}
            {place.isVeg === false && (
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400">
                Non-Veg
              </span>
            )}
            {place.city && (
              <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-white/5 border border-white/10 text-white/80">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {place.city}
              </span>
            )}
            {place.rating && (
              <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {Number(place.rating).toFixed(1)}
              </span>
            )}
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight tracking-tight">
            {place.name}
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            {place.description}
          </p>

          {/* Tour Key Metrics Row & Booking CTA */}
          {place.isTour && (
            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
                  <span className="block font-bold text-sm text-foreground">{place.duration}</span>
                  <span className="text-[10px] text-muted-foreground">Duration</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <MapPin className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                  <span className="block font-bold text-sm text-foreground">{place.stops?.length || 4} Stops</span>
                  <span className="text-[10px] text-muted-foreground">Food Tastings</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <Footprints className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <span className="block font-bold text-sm text-foreground">{place.distance || '1.8 km'}</span>
                  <span className="text-[10px] text-muted-foreground">{place.difficulty || 'Easy Walk'}</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <IndianRupee className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <span className="block font-bold text-sm text-foreground">₹{place.price}</span>
                  <span className="text-[10px] text-muted-foreground">Per Person</span>
                </div>
              </div>

              {/* Prominent Booking Action Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Instant Confirmation & Digital Ticket</span>
                </div>

                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-primary via-orange-500 to-amber-500 text-white font-bold rounded-2xl text-sm shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book This Food Tour (₹{place.price})</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* ─────────────────────────────────────────────
            VISUAL ITINERARY TIMELINE (FOR TOURS)
           ───────────────────────────────────────────── */}
        {place.isTour && place.stops?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_ENTRY, delay: 0.15 }}
            className="glass-card rounded-3xl p-6 sm:p-8 border border-white/15 bg-card/80 space-y-6 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white shadow-md">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Visual Culinary Itinerary</h2>
                <p className="text-xs text-muted-foreground">Follow the guided route and tasting sequence</p>
              </div>
            </div>

            {/* Meeting Point Banner */}
            {place.meetingPoint && (
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black font-bold text-xs shrink-0 mt-0.5">
                  🚩
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-primary">Meeting & Assembly Point</span>
                  <p className="font-bold text-sm text-foreground">{place.meetingPoint}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Gather 10 minutes prior to departure with your guide.</p>
                </div>
              </div>
            )}

            {/* Visual Timeline Nodes */}
            <div className="relative pl-6 sm:pl-8 space-y-6 border-l-2 border-primary/30 ml-4 sm:ml-5 my-4">
              {place.stops.map((stop: any, i: number) => (
                <div key={i} className="relative group">
                  {/* Numbered Circle Node */}
                  <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-600 border-2 border-background flex items-center justify-center text-white font-bold text-xs shadow-md group-hover:scale-110 transition-transform">
                    {i + 1}
                  </div>

                  {/* Stop Card */}
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/40 transition-all space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-display font-bold text-base sm:text-lg text-foreground">
                        {stop.name}
                      </h3>
                      {stop.timeSpent && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-primary" /> {stop.timeSpent}
                        </span>
                      )}
                    </div>

                    {stop.highlightDish && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary/15 border border-primary/30 text-xs font-bold text-primary">
                        <span>🍽️ Highlight Dish:</span>
                        <span>{stop.highlightDish}</span>
                      </div>
                    )}

                    {stop.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {stop.description}
                      </p>
                    )}

                    {/* Transit time to next stop */}
                    {stop.walkingTimeToNext && i < place.stops.length - 1 && (
                      <div className="pt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground/80 font-medium">
                        <Footprints className="w-3.5 h-3.5 text-primary" />
                        <span>{stop.walkingTimeToNext} to next tasting stop</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Tour Conclusion Milestone */}
              <div className="relative">
                <div className="absolute -left-[35px] sm:-left-[43px] top-1 w-8 h-8 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center text-white text-xs shadow-md">
                  🏁
                </div>
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                  <span className="font-bold block text-sm">Tour Completed & Digital Passport Certified</span>
                  <p className="text-emerald-400/80 mt-0.5">Receive your Gaekwad culinary badge and personalized food recommendations.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─────────────────────────────────────────────
            INTERACTIVE ROUTE MAP SECTION
           ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_ENTRY, delay: 0.2 }}
          className="glass-card rounded-3xl p-6 sm:p-8 border border-white/15 bg-card/80 space-y-4 shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white shadow-md">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                {place.isTour ? 'Interactive Tour Route Map' : 'Location'}
              </h2>
              {place.address && (
                <p className="text-xs text-muted-foreground mt-0.5">{place.address}</p>
              )}
            </div>
          </div>

          <PlaceMap
            lat={place.lat}
            lng={place.lng}
            latitude={place.lat}
            longitude={place.lng}
            name={place.name}
            address={place.address}
            stops={place.stops}
            isTour={place.isTour}
          />
        </motion.div>

        {/* ─────────────────────────────────────────────
            TOUR INFORMATION HUB (INCLUDES, BRING, RULES)
           ───────────────────────────────────────────── */}
        {place.isTour && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_ENTRY, delay: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* What is Included */}
            <div className="glass-card rounded-3xl p-6 border border-white/15 bg-card/80 space-y-3">
              <div className="flex items-center gap-2 text-foreground font-display font-bold text-base">
                <Package className="w-4 h-4 text-primary" />
                <span>What's Included</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                {(place.includes && place.includes.length > 0 ? place.includes : [
                  'All food and drink tastings at every stop',
                  'Local culinary historian storyteller guide',
                  'Chilled bottled mineral water',
                  'Digital Tour Passport certificate'
                ]).map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What to Bring & Rules */}
            <div className="glass-card rounded-3xl p-6 border border-white/15 bg-card/80 space-y-3">
              <div className="flex items-center gap-2 text-foreground font-display font-bold text-base">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Tour Guidelines & Essentials</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                {(place.whatToBring && place.whatToBring.length > 0 ? place.whatToBring : [
                  'Comfortable walking shoes',
                  'Sun protection or light evening jacket',
                  'An appetite for authentic Vadodara flavors'
                ]).map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
                <li className="pt-2 text-[11px] text-white/50 border-t border-white/10">
                  🛡️ {place.cancellationPolicy}
                </li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* Regular Place Menu */}
        {!place.isTour && place.menu?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_ENTRY, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">Menu</h2>
            </div>
            <div className="space-y-2">
              {place.menu.map((item: any, i: number) => (
                <MenuItemCard key={i} item={item} />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Interactive Tour Booking Modal */}
      {place.isTour && isBookingModalOpen && (
        <TourModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          tour={place}
        />
      )}
    </div>
  );
};

export default PlaceDetail;
