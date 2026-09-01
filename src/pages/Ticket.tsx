import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Ticket as TicketIcon, Calendar, Clock, MapPin, CheckCircle, Printer, Download, User, ShieldCheck } from 'lucide-react';
import { paymentsApi } from '@/lib/api';
import { SPRING_ENTRY } from '@/motion/motionPresets';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';

const Ticket = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;

    const fetchTicket = async () => {
      try {
        setLoading(true);
        const res = await paymentsApi.getBookingById(bookingId);
        if (res.success && res.data) {
          setBooking(res.data);
        } else {
          setError(res.error || 'Failed to load booking ticket');
        }
      } catch (err: any) {
        setError(err.message || 'Error loading ticket');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <div className="glass-card p-8 max-w-md w-full border-rose-500/20">
          <h2 className="text-xl font-bold text-white mb-2">Ticket Unavailable</h2>
          <p className="text-muted-foreground text-sm mb-6">{error || 'Booking details not found.'}</p>
          <Button onClick={() => navigate('/dashboard')} className="w-full">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const tour = booking.tourId || {};
  const user = booking.userId || {};

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Navbar variant="back" title="Tour Pass & Ticket" backPath="/dashboard" backLabel="Dashboard" />

      <main className="pt-24 px-4 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between no-print">
          <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="outline" size="sm" className="flex items-center gap-2">
              <Printer className="w-4 h-4" /> Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Ticket Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING_ENTRY}
          className="glass-card overflow-hidden border-primary/30 shadow-2xl relative"
        >
          {/* Header Badge */}
          <div className="bg-gradient-to-r from-primary to-orange-500 p-6 text-black flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-black/80 text-xs font-bold uppercase tracking-wider">
                <TicketIcon className="w-4 h-4" /> FoodYatra Tour Pass
              </div>
              <h1 className="text-2xl font-bold font-display mt-1">{tour.title || 'Food Tour Pass'}</h1>
              <p className="text-xs font-semibold text-black/70 mt-0.5">📍 {tour.city || 'Vadodara'}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-black/10 flex items-center justify-center font-bold text-xl">
              🎫
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Status Banner */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Booking Status</p>
                  <p className="text-sm font-bold text-white capitalize">{booking.status} ({booking.paymentMethod})</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Amount Paid</p>
                <p className="text-base font-bold text-primary">₹{booking.amountPaid}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm border-y border-white/10 py-6">
              <div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-primary" /> Guest Name
                </span>
                <p className="font-semibold text-white mt-1">{user.name || 'FoodYatra Explorer'}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>

              <div>
                <span className="text-xs text-muted-foreground">Booking ID</span>
                <p className="font-mono text-xs text-primary font-bold mt-1 truncate">{booking._id}</p>
                <span className="text-[10px] text-muted-foreground block mt-0.5">Ref: {booking.paymentReference}</span>
              </div>

              <div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> Tour Date
                </span>
                <p className="font-semibold text-white mt-1">
                  {tour.date ? new Date(tour.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'Flexible Date'}
                </p>
              </div>

              <div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-primary" /> Duration
                </span>
                <p className="font-semibold text-white mt-1">{tour.duration || '2-3 Hours'}</p>
              </div>
            </div>

            {/* Meeting Point */}
            {tour.meetingPoint && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs text-primary font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                  <MapPin className="w-3.5 h-3.5" /> Meeting Location
                </span>
                <p className="text-sm font-semibold text-white">{tour.meetingPoint}</p>
              </div>
            )}

            {/* Simulated QR Code */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white text-black text-center space-y-3">
              <div className="p-3 bg-black rounded-xl">
                {/* SVG QR Code Pattern */}
                <svg className="w-32 h-32 text-white fill-current" viewBox="0 0 100 100">
                  <rect x="0" y="0" width="30" height="30" />
                  <rect x="5" y="5" width="20" height="20" fill="white" />
                  <rect x="10" y="10" width="10" height="10" />

                  <rect x="70" y="0" width="30" height="30" />
                  <rect x="75" y="5" width="20" height="20" fill="white" />
                  <rect x="80" y="10" width="10" height="10" />

                  <rect x="0" y="70" width="30" height="30" />
                  <rect x="5" y="75" width="20" height="20" fill="white" />
                  <rect x="10" y="80" width="10" height="10" />

                  <rect x="40" y="10" width="20" height="10" />
                  <rect x="40" y="30" width="10" height="20" />
                  <rect x="60" y="40" width="20" height="10" />
                  <rect x="40" y="70" width="20" height="20" />
                  <rect x="70" y="70" width="10" height="20" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest uppercase text-gray-700">Scan Pass at Entry</p>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5">{booking._id}</p>
              </div>
            </div>

            {/* Verification Footer */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Official FoodYatra Verified Pass
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Ticket;
