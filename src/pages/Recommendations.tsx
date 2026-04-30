import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SPRING_HOVER } from '@/motion/motionPresets';
import { ArrowLeft, Sparkles, MapPin, IndianRupee, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { recommendationsApi } from '@/lib/api';

const Recommendations = () => {
    const navigate = useNavigate();
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const response = await recommendationsApi.getMyRecommendations();
                if (response.success) {
                    setRecommendations(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch recommendations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, []);

    return (
        <div className="min-h-screen pb-20">
            <div className="fixed inset-0 neural-bg -z-10" />

            <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
                <div className="max-w-7xl mx-auto glass-card px-5 py-3 flex items-center justify-between">
                    <motion.button
                        whileHover={{ x: -2 }}
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </motion.button>
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <span className="font-display font-bold text-xl">For You</span>
                    </div>
                    <div className="w-8" />
                </div>
            </nav>

            <main className="pt-24 px-4 max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
                        <span className="gradient-text">Personalized</span> Picks
                    </h1>
                    <p className="text-muted-foreground">
                        Curated recommendations based on your taste and budget.
                    </p>
                </div>

                <div className="mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 flex flex-col md:flex-row items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-lg">Want a Guided Experience?</h3>
                                <p className="text-sm text-muted-foreground">Book professionally curated food tours in your city.</p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/tours')}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 whitespace-nowrap shadow-lg shadow-primary/20"
                        >
                            View Food Tours <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    </motion.div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center min-h-[40vh]">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : recommendations.length === 0 ? (
                    <div className="text-center py-16 bg-secondary/20 rounded-2xl glass-card">
                        <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold mb-2">No recommendations found</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Try updating your preferences in your profile to get better suggestions!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendations.map((rec) => (
                            <motion.div
                                key={rec._id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -5 }}
                                className="glass-card overflow-hidden group"
                            >
                                <div className="h-48 relative overflow-hidden">

                                    <motion.img
                                        src={rec.image}
                                        alt={rec.title}
                                        className="w-full h-full object-cover"
                                        whileHover={{ scale: 1.05, transition: SPRING_HOVER }}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=300&fit=crop';
                                        }}
                                    />
                                    {rec.isAdminFavorite && (
                                        <div className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-xs font-bold px-2 py-1 rounded-lg backdrop-blur-md flex items-center gap-1 shadow-lg">
                                            <Sparkles className="w-3 h-3" />
                                            Editor's Choice
                                        </div>
                                    )}
                                    <div className="absolute bottom-3 left-3 flex gap-2">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-md border ${rec.foodType === 'veg'
                                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                                            : 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                                            }`}>
                                            {rec.foodType === 'veg' ? 'VEG' : 'NON-VEG'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-display font-bold text-xl group-hover:text-primary transition-colors">{rec.title}</h3>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {rec.city}
                                        </div>
                                        <div className="flex items-center gap-1 font-medium text-accent">
                                            <IndianRupee className="w-3.5 h-3.5" />
                                            {rec.budget === 'low' ? 'Budget' : rec.budget === 'medium' ? 'Standard' : 'Premium'}
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                        {rec.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Recommendations;
