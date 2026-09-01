import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Compass, Heart, Award, MapPin, Calendar, Trash2, Ticket, 
  Sparkles, Utensils, Star, AlertCircle, CheckCircle2, ChevronRight 
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { userJourneyApi, paymentsApi } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';

const COLORS = ['#f97316', '#e11d48', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

const FoodJourney = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [journeyData, setJourneyData] = useState<any>(null);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [journeyRes, bookingsRes] = await Promise.all([
        userJourneyApi.getJourney(),
        paymentsApi.getMyBookings()
      ]);

      if (journeyRes.success && journeyRes.data) {
        setJourneyData(journeyRes.data);
      }
      if (bookingsRes.success && bookingsRes.data) {
        setMyBookings(bookingsRes.data);
      }
    } catch (error) {
      console.error('Failed to load Food Journey:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (place: any) => {
    try {
      const res = await userJourneyApi.toggleFavorite({
        placeId: place.placeId,
        placeType: place.placeType,
        name: place.name
      });
      if (res.success) {
        toast({
          title: "Removed from favorites",
          description: `${place.name} has been removed from your saved list.`
        });
        loadData();
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to remove favorite",
        variant: "destructive"
      });
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    setCancellingId(bookingId);
    try {
      const res = await paymentsApi.cancelBooking(bookingId, "Cancelled by user");
      if (res.success) {
        toast({
          title: "Booking Cancelled",
          description: "Your tour reservation was cancelled and slot capacity restored."
        });
        loadData();
      } else {
        toast({
          title: "Cancellation Failed",
          description: res.error || "Could not cancel booking",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to cancel booking",
        variant: "destructive"
      });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary via-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg">
                <Compass className="w-6 h-6 animate-spin-slow" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">My Food Journey</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1 ml-13">
              Your personalized culinary passport and taste evolution across Vadodara
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/food')}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition-all shadow-md"
            >
              Explore More Food
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground space-y-3">
            <Sparkles className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm">Calculating your taste DNA and journey milestones...</p>
          </div>
        ) : journeyData ? (
          <>
            {/* 1. Food Personality Hero Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-primary/20 via-orange-500/15 to-amber-500/10 border border-primary/30 shadow-2xl backdrop-blur-md"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-black/40 border border-white/20 flex items-center justify-center text-3xl shadow-inner shrink-0">
                    {journeyData.personality?.icon || '✨'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/30 text-primary border border-primary/40">
                        Taste Personality
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-foreground mt-1">
                      {journeyData.personality?.title || 'Culinary Adventurer'}
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-xl mt-1 leading-relaxed">
                      {journeyData.personality?.description || 'Exploring the rich culinary culture of Vadodara.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-black/40 px-4 py-3 rounded-2xl border border-white/10 shrink-0">
                  <Award className="w-6 h-6 text-yellow-400" />
                  <div>
                    <p className="text-[11px] text-muted-foreground">Passport Level</p>
                    <p className="text-sm font-bold text-foreground">
                      {journeyData.stats.placesExplored >= 10 ? 'Master Gourmet' : journeyData.stats.placesExplored >= 5 ? 'Curious Explorer' : 'Apprentice Foodie'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 2. Key KPI Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-card border border-white/10 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-center text-muted-foreground mb-2">
                  <span className="text-xs font-medium">Places Explored</span>
                  <Utensils className="w-4 h-4 text-primary" />
                </div>
                <div className="text-3xl font-black text-foreground">{journeyData.stats.placesExplored}</div>
                <p className="text-[11px] text-muted-foreground mt-1">Venues & dishes viewed</p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-white/10 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-center text-muted-foreground mb-2">
                  <span className="text-xs font-medium">Saved Favorites</span>
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                </div>
                <div className="text-3xl font-black text-foreground">{journeyData.stats.favoritesCount}</div>
                <p className="text-[11px] text-muted-foreground mt-1">Bookmarked culinary spots</p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-white/10 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-center text-muted-foreground mb-2">
                  <span className="text-xs font-medium">Food Searches</span>
                  <Compass className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-3xl font-black text-foreground">{journeyData.stats.searchesCount}</div>
                <p className="text-[11px] text-muted-foreground mt-1">Inquiries made</p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-white/10 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-center text-muted-foreground mb-2">
                  <span className="text-xs font-medium">Tours Booked</span>
                  <Ticket className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-3xl font-black text-foreground">{journeyData.stats.toursBooked}</div>
                <p className="text-[11px] text-muted-foreground mt-1">Guided walking tours</p>
              </div>
            </div>

            {/* 3. Visual Charts Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cuisine Preferences */}
              <div className="p-6 rounded-3xl bg-card border border-white/10 shadow-sm flex flex-col">
                <h3 className="text-base font-bold mb-1">Cuisine Exploration Breakdown</h3>
                <p className="text-xs text-muted-foreground mb-6">Distribution of your favorite and explored food genres</p>
                <div className="h-64 w-full">
                  {journeyData.cuisineBreakdown && journeyData.cuisineBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={journeyData.cuisineBreakdown} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 12, fill: 'currentColor' }} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
                        <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                          {journeyData.cuisineBreakdown.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                      Explore and favorite foods to see your cuisine chart!
                    </div>
                  )}
                </div>
              </div>

              {/* Price Tier Distribution */}
              <div className="p-6 rounded-3xl bg-card border border-white/10 shadow-sm flex flex-col">
                <h3 className="text-base font-bold mb-1">Price Tier Preferences</h3>
                <p className="text-xs text-muted-foreground mb-6">Affordability profile of places you interact with</p>
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={journeyData.priceDistribution || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {(journeyData.priceDistribution || []).map((_: any, index: number) => (
                          <Cell key={`pie-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 text-xs mt-2">
                  {(journeyData.priceDistribution || []).map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-muted-foreground">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Saved Favorites Collection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Saved Favorites ({journeyData.favorites.length})</h3>
                  <p className="text-xs text-muted-foreground">Your bookmarked dishes and eateries across Vadodara</p>
                </div>
              </div>

              {journeyData.favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {journeyData.favorites.map((fav: any, idx: number) => (
                    <div
                      key={fav.placeId || idx}
                      className="rounded-2xl border border-white/10 bg-card overflow-hidden shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between group"
                    >
                      <div className="relative h-32 w-full overflow-hidden bg-black/40">
                        <img
                          src={fav.image}
                          alt={fav.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/SevUsal.png';
                          }}
                        />
                        <button
                          onClick={() => handleRemoveFavorite(fav)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-rose-400 hover:text-rose-300 hover:bg-black transition-colors"
                          title="Remove from favorites"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/80 px-2 py-0.5 rounded-full text-xs font-bold text-white">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          {Number(fav.rating || 4.2).toFixed(1)}
                        </div>
                      </div>

                      <div className="p-3.5 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-foreground line-clamp-1">{fav.name}</h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-primary shrink-0" />
                            {fav.area || 'Vadodara'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                          <span className="text-[11px] font-semibold text-primary">{fav.cuisine || 'Indian'}</span>
                          {fav.placeId && (
                            <button
                              onClick={() => navigate(`/place/${fav.placeId}`)}
                              className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                            >
                              View <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-card border border-white/10 text-center text-muted-foreground space-y-2">
                  <Heart className="w-8 h-8 mx-auto text-muted-foreground/30" />
                  <p className="text-sm font-semibold">No favorites saved yet</p>
                  <p className="text-xs">Click the heart icon on any food card to bookmark your favorites here.</p>
                </div>
              )}
            </div>

            {/* 5. Food Walking Tour Reservations */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div>
                <h3 className="text-xl font-bold">My Food Tour Bookings</h3>
                <p className="text-xs text-muted-foreground">Manage your upcoming culinary walks and digital tickets</p>
              </div>

              {myBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myBookings.map((b: any) => {
                    const tour = b.tourId || {};
                    const isCancelled = b.status === 'cancelled';

                    return (
                      <div
                        key={b._id}
                        className={`p-5 rounded-2xl border ${isCancelled ? 'border-white/5 bg-white/2 opacity-60' : 'border-white/15 bg-card'} shadow-sm flex flex-col justify-between space-y-4`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${isCancelled ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                              {isCancelled ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                              {isCancelled ? 'Cancelled' : 'Confirmed Reservation'}
                            </span>
                            <h4 className="text-base font-bold text-foreground mt-1.5">{tour.title || 'Vadodara Food Walk'}</h4>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-primary shrink-0" />
                              Meeting Point: {tour.meetingPoint || 'Raopura Tower, Vadodara'}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-xs text-muted-foreground">Ticket ID</span>
                            <p className="text-xs font-mono font-bold text-primary">{b.ticketCode || b._id.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-white/5">
                          <div>
                            <span className="text-muted-foreground block text-[11px]">Schedule</span>
                            <span className="font-semibold text-foreground">
                              {b.slotTime || '10:00 AM'} • {new Date(b.slotDate || b.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[11px]">Participants</span>
                            <span className="font-semibold text-foreground">{b.participantsCount || 1} Person(s)</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <span className="text-sm font-bold text-foreground">Total: ₹{b.amountPaid}</span>

                          <div className="flex items-center gap-2">
                            {!isCancelled && (
                              <button
                                onClick={() => handleCancelBooking(b._id)}
                                disabled={cancellingId === b._id}
                                className="px-3 py-1.5 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 text-xs font-semibold transition-colors disabled:opacity-50"
                              >
                                {cancellingId === b._id ? 'Cancelling...' : 'Cancel Booking'}
                              </button>
                            )}
                            <button
                              onClick={() => navigate(`/tickets/${b._id}`)}
                              className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Ticket className="w-3.5 h-3.5" /> View Ticket
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-card border border-white/10 text-center text-muted-foreground space-y-2">
                  <Ticket className="w-8 h-8 mx-auto text-muted-foreground/30" />
                  <p className="text-sm font-semibold">No food tour bookings yet</p>
                  <p className="text-xs">Browse guided street food walks across old Vadodara in our Tours section.</p>
                  <button
                    onClick={() => navigate('/tours')}
                    className="mt-3 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90"
                  >
                    View Food Tours
                  </button>
                </div>
              )}
            </div>
          </>
        ) : null}
      </main>

      <BottomNav />
    </div>
  );
};

export default FoodJourney;
