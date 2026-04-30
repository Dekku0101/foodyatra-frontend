import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, MapPin, Heart, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { favoritesApi, foodPlacesApi } from '@/lib/api';
import Navbar from "@/components/Navbar";

const Food = () => {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState<any[]>([]);
    const [foodPlaces, setFoodPlaces] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [favResponse, placesResponse] = await Promise.all([
                    favoritesApi.getAll(),
                    foodPlacesApi.getAllFoodPlaces()
                ]);

                if (favResponse.success) {
                    setFavorites(favResponse.data);
                }

                if (placesResponse.success) {
                    setFoodPlaces(placesResponse.data);
                }
            } catch (error) {
                console.error('Failed to fetch food data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="min-h-screen pb-20">
            <div className="fixed inset-0 neural-bg -z-10" />

            {/* Navbar Integration */}
            <Navbar variant="back" title="Food & Favorites" backPath="/dashboard" backLabel="Back" />

            <main className="pt-24 px-4 max-w-7xl mx-auto space-y-12">

                {loading ? (
                    <div className="flex items-center justify-center min-h-[50vh]">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {/* Favorites Section */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                    <Heart className="w-5 h-5 text-primary fill-primary" />
                                </div>
                                <h2 className="font-display text-2xl font-bold">Curated Favorites</h2>
                            </div>

                            {favorites.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground bg-secondary/20 rounded-xl">
                                    No favorites added yet. Check back soon!
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {favorites.map((fav) => (
                                        <motion.div
                                            key={fav._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            className="glass-card overflow-hidden group"
                                        >
                                            <div className="h-48 bg-secondary/30 relative overflow-hidden">
                                                {/* Placeholder or actual image if available in future */}
                                                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                                                    🥘
                                                </div>
                                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1">
                                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                                    Featured
                                                </div>
                                            </div>
                                            <div className="p-5">
                                                <h3 className="font-display font-bold text-lg mb-1 group-hover:text-primary transition-colors">{fav.name}</h3>
                                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{fav.description}</p>

                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        {fav.city}
                                                    </div>
                                                    <div className="font-semibold text-accent">
                                                        {fav.priceRange}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* All Food Places Section */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-accent" />
                                </div>
                                <h2 className="font-display text-2xl font-bold">All Food Places</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {foodPlaces.map((place) => (
                                    <motion.div
                                        key={place._id}
                                        whileHover={{ y: -5 }}
                                        className="glass-card p-4 flex flex-col gap-3"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-bold text-foreground">{place.name}</h4>
                                                <p className="text-xs text-muted-foreground">{place.cuisine}</p>
                                            </div>
                                            <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">
                                                {place.rating} ★
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{place.description}</p>
                                        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">{place.area}</span>
                                            {place.isVeg && <span className="text-emerald-400 font-medium">Pure Veg</span>}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};

export default Food;
