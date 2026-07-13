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
} from 'lucide-react';
import { foodPlacesApi, famousPlaceApi, toursApi } from '@/lib/api';
import { staticPlacesMap } from '@/data/mockData';
import PlaceMap from '@/components/PlaceMap';
import { SPRING_ENTRY } from '@/motion/motionPresets';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const normalize = (raw: any, type: string): any | null => {
  if (!raw) return null;

  if (type === 'static' || type === 'foodplace') {
    // FoodPlace / static mockData shape
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
    // FamousPlace: dish category with locations[]
    const bestLoc =
      (raw.locations ?? []).reduce(
        (best: any, cur: any) => (cur.rating > (best?.rating ?? 0) ? cur : best),
        raw.locations?.[0] ?? {}
      );
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
      isVeg: true,
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
      name: raw.title,
      image: raw.image,
      description: raw.description,
      city: raw.city,
      rating: raw.rating || 4.8,
      isVeg: null,
      price: raw.price,
      duration: raw.duration,
      meetingPoint: raw.meetingPoint,
      stops: raw.stops || [],
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

  const [place, setPlace] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        if (type === 'static') {
          // Look up from the static map
          const staticEntry = staticPlacesMap[id] ?? staticPlacesMap[Number(id)];
          if (!staticEntry) throw new Error('Place not found');
          setPlace(normalize(staticEntry, 'static'));
          return;
        }

        // For DB types: validate ObjectId format (24 hex chars) before querying
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

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Error ──
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

  // ── Render ──
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Image */}
      <div className="relative w-full h-[50vh] min-h-[300px] overflow-hidden">
        {place.image ? (
          <img
            src={place.image}
            alt={place.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-background" />
        )}
        {/* Cinematic fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={SPRING_ENTRY}
          onClick={() => navigate(-1)}
          className="absolute top-6 left-4 md:left-8 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 border border-white/15 backdrop-blur-md text-white text-sm font-medium hover:bg-black/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 pb-20 -mt-24 relative z-10">

        {/* Name + Meta */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING_ENTRY}
        >
          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {place.isTour && (
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-primary/15 border border-primary/30 text-primary">
                Food Tour
              </span>
            )}
            {place.isVeg === true && (
              <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <Leaf className="w-3 h-3" /> Veg
              </span>
            )}
            {place.isVeg === false && (
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400">
                Non-Veg
              </span>
            )}
            {place.city && (
              <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-white/5 border border-white/10 text-white/60">
                <MapPin className="w-3 h-3 text-primary" />
                {place.city}
              </span>
            )}
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">
            {place.name}
          </h1>

          {/* Rating + sub-info */}
          <div className="flex flex-wrap items-center gap-4 mt-3 mb-6 text-sm text-white/70">
            {place.rating && (
              <span className="flex items-center gap-1.5 font-semibold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {place.rating}
              </span>
            )}
            {place.area && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {place.area}
              </span>
            )}
            {place.priceRange && (
              <span className="flex items-center gap-0.5 text-primary font-bold">
                <IndianRupee className="w-3.5 h-3.5" />
                {place.priceRange}
              </span>
            )}
            {place.price != null && (
              <span className="flex items-center gap-0.5 text-primary font-bold">
                <IndianRupee className="w-3.5 h-3.5" />
                {place.price} per person
              </span>
            )}
            {place.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-primary" />
                {place.duration}
              </span>
            )}
          </div>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_ENTRY, delay: 0.1 }}
          className="text-white/70 text-base leading-relaxed mb-10"
        >
          {place.description}
        </motion.p>

        {/* Tour stops list */}
        {place.isTour && place.stops?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_ENTRY, delay: 0.15 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold text-white">Tour Stops</h2>
            </div>
            <div className="space-y-3">
              {place.stops.map((stop: any, i: number) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{stop.name}</p>
                    {stop.highlightDish && (
                      <p className="text-xs text-primary mt-0.5">🍽 {stop.highlightDish}</p>
                    )}
                    {stop.description && (
                      <p className="text-xs text-white/50 mt-1">{stop.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Menu */}
        {place.menu?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_ENTRY, delay: 0.2 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold text-white">Menu</h2>
            </div>
            <div className="space-y-2">
              {place.menu.map((item: any, i: number) => (
                <MenuItemCard key={i} item={item} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Meeting point for tours */}
        {place.meetingPoint && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_ENTRY, delay: 0.25 }}
            className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <p className="text-xs uppercase tracking-widest text-primary font-bold mb-1">Meeting Point</p>
            <p className="text-white/80 text-sm">{place.meetingPoint}</p>
          </motion.div>
        )}

        {/* Location / Map section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_ENTRY, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">Location</h2>
              {place.address && (
                <p className="text-xs text-white/50 mt-0.5">{place.address}</p>
              )}
            </div>
          </div>

          <PlaceMap
            lat={place.lat}
            lng={place.lng}
            name={place.name}
            stops={place.stops}
            isTour={place.isTour}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default PlaceDetail;
