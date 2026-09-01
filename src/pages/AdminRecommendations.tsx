import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, Sparkles, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminRecommendationsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const AdminRecommendations = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentRec, setCurrentRec] = useState<any>(null); // For edit/create

    const fetchRecommendations = async () => {
        setLoading(true);
        try {
            const response = await adminRecommendationsApi.getAll();
            if (response.success) {
                setRecommendations(response.data);
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch recommendations', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const handleCreate = () => {
        setCurrentRec({
            title: '',
            city: '',
            foodType: 'veg',
            budget: 'medium',
            image: '',
            description: '',
            isAdminFavorite: true
        });
        setIsEditing(true);
    };

    const handleEdit = (rec: any) => {
        setCurrentRec({ ...rec });
        setIsEditing(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this recommendation?')) return;
        try {
            await adminRecommendationsApi.delete(id);
            toast({ title: 'Success', description: 'Recommendation deleted' });
            fetchRecommendations();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentRec._id) {
                await adminRecommendationsApi.update(currentRec._id, currentRec);
                toast({ title: 'Success', description: 'Recommendation updated' });
            } else {
                await adminRecommendationsApi.create(currentRec);
                toast({ title: 'Success', description: 'Recommendation created' });
            }
            setIsEditing(false);
            fetchRecommendations();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' });
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-xl font-bold font-display">Manage Recommendations</h1>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="w-4 h-4 mr-2" /> Add New
                    </Button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendations.map((rec) => (
                            <div key={rec._id} className="glass-card overflow-hidden group border border-border/50">
                                <div className="h-40 relative">
                                    <img src={rec.image} alt={rec.title} className="w-full h-full object-cover" />
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <Button size="icon" variant="secondary" className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-none" onClick={() => handleEdit(rec)}>
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDelete(rec._id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-bold text-lg">{rec.title}</h3>
                                        {rec.isAdminFavorite && <Sparkles className="w-4 h-4 text-primary" />}
                                    </div>
                                    <div className="flex gap-2 text-xs text-muted-foreground mb-3">
                                        <span className="px-2 py-1 rounded bg-secondary">{rec.city}</span>
                                        <span className="px-2 py-1 rounded bg-secondary">{rec.foodType}</span>
                                        <span className="px-2 py-1 rounded bg-secondary">{rec.budget}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{rec.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="p-6 border-b border-border flex items-center justify-between">
                                <h2 className="text-xl font-bold">{currentRec._id ? 'Edit' : 'New'} Recommendation</h2>
                                <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                                <form id="rec-form" onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input id="title" required value={currentRec.title} onChange={(e) => setCurrentRec({ ...currentRec, title: e.target.value })} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="city">City</Label>
                                            <Input id="city" required value={currentRec.city} onChange={(e) => setCurrentRec({ ...currentRec, city: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="image">Image URL</Label>
                                            <Input id="image" required value={currentRec.image} onChange={(e) => setCurrentRec({ ...currentRec, image: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Food Type</Label>
                                            <Select value={currentRec.foodType} onValueChange={(val) => setCurrentRec({ ...currentRec, foodType: val })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="veg">Veg</SelectItem>
                                                    <SelectItem value="non-veg">Non-Veg</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Budget</Label>
                                            <Select value={currentRec.budget} onValueChange={(val) => setCurrentRec({ ...currentRec, budget: val })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">Low</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="desc">Description</Label>
                                        <Textarea id="desc" required className="h-24" value={currentRec.description} onChange={(e) => setCurrentRec({ ...currentRec, description: e.target.value })} />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isFav"
                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            checked={currentRec.isAdminFavorite}
                                            onChange={(e) => setCurrentRec({ ...currentRec, isAdminFavorite: e.target.checked })}
                                        />
                                        <Label htmlFor="isFav" className="cursor-pointer">Mark as Editor's Choice (Admin Favorite)</Label>
                                    </div>
                                </form>
                            </div>

                            <div className="p-4 border-t border-border bg-card/50 flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button type="submit" form="rec-form">Save Changes</Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminRecommendations;
