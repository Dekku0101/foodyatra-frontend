import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scale, Star, MapPin, Sparkles, Utensils, IndianRupee, ExternalLink } from 'lucide-react';
import { foodPlacesApi } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlaceIds: string[];
  onRemovePlace: (id: string) => void;
}

const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  selectedPlaceIds,
  onRemovePlace
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState<{ places: any[]; verdict: string } | null>(null);

  useEffect(() => {
    if (isOpen && selectedPlaceIds.length >= 2) {
      loadComparison();
    }
  }, [isOpen, selectedPlaceIds]);

  const loadComparison = async () => {
    setLoading(true);
    try {
      const res = await foodPlacesApi.comparePlaces(selectedPlaceIds);
      if (res.success && res.data) {
        setComparisonData(res.data);
      }
    } catch (err) {
      console.error('Failed to compare places:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-card border border-white/15 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-foreground"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-primary/10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-lg">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Compare Food Places</h2>
                <p className="text-xs text-muted-foreground">Side-by-side culinary comparison across Vadodara</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground space-y-3">
                <Sparkles className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm font-medium">Generating comparison metrics and AI insights...</p>
              </div>
            ) : comparisonData && comparisonData.places.length >= 2 ? (
              <>
                {/* AI Verdict Box */}
                {comparisonData.verdict && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/20 via-orange-500/15 to-amber-500/10 border border-primary/30 flex items-start gap-3 shadow-md">
                    <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Zayka AI Comparison Insight</h4>
                      <p className="text-sm text-foreground/90 mt-1 leading-relaxed">{comparisonData.verdict}</p>
                    </div>
                  </div>
                )}

                {/* Comparison Grid */}
                <div className={`grid grid-cols-1 md:grid-cols-${comparisonData.places.length} gap-4`}>
                  {comparisonData.places.map((place) => (
                    <div
                      key={place.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors shadow-sm"
                    >
                      {/* Image & Title */}
                      <div>
                        <div className="relative h-36 rounded-xl overflow-hidden mb-3 bg-black/40">
                          <img
                            src={place.image}
                            alt={place.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/SevUsal.png';
                            }}
                          />
                          <button
                            onClick={() => onRemovePlace(place.id)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white/80 hover:text-white hover:bg-black transition-colors"
                            title="Remove from comparison"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/75 px-2 py-0.5 rounded-full text-xs font-bold text-white border border-white/10">
                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                            {Number(place.rating).toFixed(1)}
                          </div>
                        </div>

                        <h3 className="font-bold text-base text-foreground line-clamp-1">{place.name}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-primary shrink-0" />
                          {place.area}, {place.city}
                        </p>
                      </div>

                      {/* Attributes Table */}
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-muted-foreground">Cuisine</span>
                          <span className="font-semibold text-foreground">{place.cuisine}</span>
                        </div>

                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-muted-foreground">Dietary</span>
                          <span className={`font-semibold ${place.isVeg ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {place.isVeg ? '100% Pure Veg' : 'Non-Vegetarian'}
                          </span>
                        </div>

                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-muted-foreground">Price Tier</span>
                          <span className="font-semibold text-foreground">{place.price}</span>
                        </div>

                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-muted-foreground">Food Type</span>
                          <span className="font-semibold capitalize text-foreground">{place.foodType}</span>
                        </div>

                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-muted-foreground">Famous Dish</span>
                          <span className="font-semibold text-primary">{place.famousDish}</span>
                        </div>

                        {place.menuHighlights && place.menuHighlights.length > 0 && (
                          <div className="pt-1">
                            <span className="text-muted-foreground block mb-1">Top Menu Items:</span>
                            <div className="flex flex-wrap gap-1">
                              {place.menuHighlights.map((item: string, idx: number) => (
                                <span key={idx} className="px-2 py-0.5 rounded-md bg-white/10 text-[11px] font-medium text-foreground">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* CTA Buttons */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => {
                            navigate(`/place/${place.id}`);
                            onClose();
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          View Place
                        </button>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ', ' + place.area + ', Vadodara')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-foreground text-xs transition-colors flex items-center justify-center"
                          title="Open Google Maps"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 space-y-3 text-muted-foreground">
                <Scale className="w-12 h-12 text-muted-foreground/40 mx-auto" />
                <p className="text-base font-semibold">Select at least 2 food places to compare</p>
                <p className="text-xs max-w-md mx-auto">
                  Click the comparison icon on any food card in the Food Directory or Dashboard to add places here!
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CompareModal;
