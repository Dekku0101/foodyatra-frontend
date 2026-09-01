import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi, adminApi, famousPlaceApi, toursApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Utensils, MapPin, Plus, Edit, Trash2, Search,
  LogOut, Home, Settings, BarChart3, Users, UserCog, Image as ImageIcon,
  Map, Star, X, ShieldAlert, Flag, CheckCircle, Eye, Calendar, Compass, IndianRupee
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

const CHART_COLORS = ['#f97316', '#e11d48', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

interface MenuItem {
  itemName: string;
  price?: number;
  description?: string;
}

interface FoodPlace {
  _id: string;
  name: string;
  city: string;
  state?: string;
  area?: string;
  address?: string;
  foodType?: string;
  category?: string;
  cuisine?: string;
  isVeg?: boolean;
  averagePrice?: number;
  famousDish?: string;
  rating?: number;
  latitude?: number;
  longitude?: number;
  image?: string;
  menu?: MenuItem[];
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  preferences?: any;
  createdAt?: string;
}

interface FamousLocation {
  name: string;
  address: string;
  area?: string;
  city?: string;
  latitude: number;
  longitude: number;
  rating?: number;
  imageUrl?: string;
}

interface FamousPlace {
  _id: string;
  dishName: string;
  description?: string;
  imageUrl: string;
  cuisine?: string;
  isVeg?: boolean;
  locations: FamousLocation[];
}

const AdminDashboard = () => {
  const [user, setUser] = useState<{ id: string; name: string; email: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'analytics' | 'food' | 'famous' | 'moderation' | 'tours' | 'users'>('analytics');

  // Analytics State
  const [analytics, setAnalytics] = useState<any | null>(null);

  // Moderation State
  const [reportedPosts, setReportedPosts] = useState<any[]>([]);

  // Tours State
  const [toursList, setToursList] = useState<any[]>([]);
  const [newSlotTourId, setNewSlotTourId] = useState<string | null>(null);
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('10:00 AM');
  const [newSlotCapacity, setNewSlotCapacity] = useState(20);
  const [selectedTourParticipants, setSelectedTourParticipants] = useState<any[] | null>(null);

  // Food Places State
  const [foodPlaces, setFoodPlaces] = useState<FoodPlace[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<FoodPlace | null>(null);
  const [formData, setFormData] = useState<Partial<FoodPlace>>({});
  const [tempMenuItem, setTempMenuItem] = useState<Partial<MenuItem>>({});
  const [isAddingMenuItem, setIsAddingMenuItem] = useState(false);

  // Users State
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState({ total: 0, admins: 0, users: 0 });
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<Partial<User>>({});

  // Famous Places State
  const [famousPlaces, setFamousPlaces] = useState<FamousPlace[]>([]);
  const [famousSearchTerm, setFamousSearchTerm] = useState('');
  const [isFamousDialogOpen, setIsFamousDialogOpen] = useState(false);
  const [editingFamous, setEditingFamous] = useState<FamousPlace | null>(null);
  const [famousFormData, setFamousFormData] = useState<Partial<FamousPlace>>({ locations: [] });
  const [tempLocation, setTempLocation] = useState<Partial<FamousLocation>>({});
  const [isAddingLocation, setIsAddingLocation] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await authApi.getCurrentUser();
        if (response.success && response.user) {
          if (response.user.role !== 'admin') {
            toast({
              title: "Access Denied",
              description: "Admin privileges required to view this panel.",
              variant: "destructive",
            });
            navigate("/dashboard");
            return;
          }
          setUser(response.user);
          await loadData();
        } else {
          navigate("/login");
        }
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate, toast]);

  const loadData = async () => {
    try {
      if (activeTab === 'analytics') {
        const res = await adminApi.getAnalytics();
        if (res.success && res.data) {
          setAnalytics(res.data);
        }
      } else if (activeTab === 'moderation') {
        const res = await adminApi.getReportedPosts();
        if (res.success && res.data) {
          setReportedPosts(res.data);
        }
      } else if (activeTab === 'tours') {
        const res = await toursApi.getAllTours();
        if (res.success && res.data) {
          setToursList(res.data);
        }
      } else if (activeTab === 'food') {
        const [foodPlacesRes, locationsRes] = await Promise.all([
          adminApi.getAllFoodPlaces(),
          adminApi.getAllLocations(),
        ]);
        if (foodPlacesRes.success) setFoodPlaces((foodPlacesRes.data || []) as FoodPlace[]);
        if (locationsRes.success) setLocations((locationsRes.data || []) as string[]);
      } else if (activeTab === 'famous') {
        const response = await famousPlaceApi.getAll();
        if (response.success) setFamousPlaces((response.data || []) as FamousPlace[]);
      } else if (activeTab === 'users') {
        const [usersRes, statsRes] = await Promise.all([
          adminApi.getAllUsers(),
          adminApi.getUserStats(),
        ]);
        if (usersRes.success) setUsers((usersRes.data || []) as User[]);
        if (statsRes.success) setUserStats((statsRes.data || { total: 0, admins: 0, users: 0 }) as any);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load data for this section",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!loading) {
      loadData();
    }
  }, [activeTab, loading]);

  const handleLogout = () => {
    authApi.logout();
    toast({ title: "Logged out", description: "See you soon!" });
    navigate("/login");
  };

  // Moderation Handlers
  const handleDismissReport = async (postId: string) => {
    try {
      const res = await adminApi.dismissPostReports(postId);
      if (res.success) {
        toast({ title: "Reports Dismissed", description: "Post restored to active status." });
        loadData();
      }
    } catch {
      toast({ title: "Error", description: "Failed to dismiss report", variant: "destructive" });
    }
  };

  const handleModerateStatus = async (postId: string, status: 'active' | 'hidden' | 'flagged') => {
    try {
      const res = await adminApi.updatePostModerationStatus(postId, status);
      if (res.success) {
        toast({ title: "Status Updated", description: `Post status set to ${status}` });
        loadData();
      }
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  // Tour Slot Handlers
  const handleAddSlot = async (tourId: string) => {
    if (!newSlotDate || !newSlotTime) {
      toast({ title: "Required Fields", description: "Please enter date and time", variant: "destructive" });
      return;
    }
    try {
      const res = await adminApi.addTourSlot(tourId, {
        date: newSlotDate,
        startTime: newSlotTime,
        capacity: newSlotCapacity
      });
      if (res.success) {
        toast({ title: "Slot Added", description: "New tour schedule slot published." });
        setNewSlotTourId(null);
        setNewSlotDate('');
        loadData();
      }
    } catch {
      toast({ title: "Error", description: "Failed to add slot", variant: "destructive" });
    }
  };

  const handleDeleteSlot = async (tourId: string, slotId: string) => {
    try {
      const res = await adminApi.deleteTourSlot(tourId, slotId);
      if (res.success) {
        toast({ title: "Slot Removed" });
        loadData();
      }
    } catch {
      toast({ title: "Error", description: "Failed to remove slot", variant: "destructive" });
    }
  };

  const handleViewParticipants = async (tourId: string) => {
    try {
      const res = await adminApi.getTourParticipants(tourId);
      if (res.success && res.data) {
        setSelectedTourParticipants(res.data);
      }
    } catch {
      toast({ title: "Error", description: "Failed to load participants", variant: "destructive" });
    }
  };

  // Food Place Handlers
  const handleEdit = (place: FoodPlace) => {
    setEditingPlace(place);
    setFormData({ ...place });
    setIsDialogOpen(true);
  };

  const handleDeletePlace = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this food place?")) return;
    try {
      const res = await adminApi.deleteFoodPlace(id);
      if (res.success) {
        toast({ title: "Food Place Deleted" });
        loadData();
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete food place", variant: "destructive" });
    }
  };

  const handleSubmitPlace = async () => {
    try {
      if (editingPlace) {
        const res = await adminApi.updateFoodPlace(editingPlace._id, formData);
        if (res.success) {
          toast({ title: "Updated successfully" });
          setIsDialogOpen(false);
          loadData();
        }
      } else {
        const res = await adminApi.createFoodPlace(formData);
        if (res.success) {
          toast({ title: "Created successfully" });
          setIsDialogOpen(false);
          loadData();
        }
      }
    } catch {
      toast({ title: "Error", description: "Failed to save food place", variant: "destructive" });
    }
  };

  // User Handlers
  const handleUserEdit = (userData: User) => {
    setEditingUser(userData);
    setUserFormData({ ...userData });
    setIsUserDialogOpen(true);
  };

  const handleUserDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await adminApi.deleteUser(id);
      if (res.success) {
        toast({ title: "User Deleted" });
        loadData();
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    }
  };

  const handleUserSubmit = async () => {
    if (!editingUser) return;
    try {
      const res = await adminApi.updateUser(editingUser._id, userFormData);
      if (res.success) {
        toast({ title: "User updated" });
        setIsUserDialogOpen(false);
        loadData();
      }
    } catch {
      toast({ title: "Error", description: "Failed to update user", variant: "destructive" });
    }
  };

  // Filter lists
  const filteredFoodPlaces = foodPlaces.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.famousDish && p.famousDish.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLoc = selectedLocation === 'all' || p.city === selectedLocation;
    return matchesSearch && matchesLoc;
  });

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Admin Header */}
      <header className="border-b border-white/10 bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight">FoodYatra Admin</span>
              <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold">Back-Office 2.0</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="text-xs">
              <Home className="w-4 h-4 mr-1.5" /> Back to App
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs border-white/10">
              <LogOut className="w-4 h-4 mr-1.5" /> Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Tabs Navigation */}
      <div className="border-b border-white/10 bg-card/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 overflow-x-auto py-2.5 custom-scrollbar">
          {[
            { id: 'analytics', label: 'Analytics & KPIs', icon: BarChart3 },
            { id: 'food', label: 'Food Places', icon: Utensils },
            { id: 'famous', label: 'Famous Dishes', icon: Star },
            { id: 'tours', label: 'Tour Slots & Rosters', icon: Compass },
            { id: 'moderation', label: `Moderation (${reportedPosts.length})`, icon: Flag },
            { id: 'users', label: 'User Directory', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Admin Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 1. ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-in fade-in">
            {analytics ? (
              <>
                {/* Top KPI Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-card border border-white/10 shadow-sm">
                    <span className="text-xs text-muted-foreground font-medium">Food Places</span>
                    <p className="text-3xl font-black text-foreground mt-1">{analytics.kpis?.totalFoodPlaces || 0}</p>
                    <span className="text-[11px] text-primary mt-1 block">Active eateries</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-card border border-white/10 shadow-sm">
                    <span className="text-xs text-muted-foreground font-medium">Total Foodies</span>
                    <p className="text-3xl font-black text-foreground mt-1">{analytics.kpis?.totalUsers || 0}</p>
                    <span className="text-[11px] text-emerald-400 mt-1 block">Registered profiles</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-card border border-white/10 shadow-sm">
                    <span className="text-xs text-muted-foreground font-medium">Tour Revenue</span>
                    <p className="text-3xl font-black text-foreground mt-1">₹{analytics.kpis?.totalRevenue || 0}</p>
                    <span className="text-[11px] text-amber-400 mt-1 block">{analytics.kpis?.totalBookings || 0} reservations</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-card border border-white/10 shadow-sm">
                    <span className="text-xs text-muted-foreground font-medium">Community Safety</span>
                    <p className="text-3xl font-black text-foreground mt-1">{analytics.kpis?.reportedPostsCount || 0}</p>
                    <span className="text-[11px] text-rose-400 mt-1 block">Flagged for review</span>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Food Type Distribution */}
                  <div className="p-6 rounded-3xl bg-card border border-white/10 shadow-sm space-y-3">
                    <h3 className="text-sm font-bold">Food Venue Type Breakdown</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.foodTypeDistribution || []}>
                          <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'currentColor' }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'currentColor' }} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px' }} />
                          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                            {(analytics.foodTypeDistribution || []).map((_: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Cuisine Popularity */}
                  <div className="p-6 rounded-3xl bg-card border border-white/10 shadow-sm space-y-3">
                    <h3 className="text-sm font-bold">Top Cuisines Represented</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.cuisineDistribution || []} layout="vertical">
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: 'currentColor' }} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px' }} />
                          <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                            {(analytics.cuisineDistribution || []).map((_: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-muted-foreground text-sm">
                Aggregating real database metrics...
              </div>
            )}
          </div>
        )}

        {/* 2. COMMUNITY MODERATION TAB */}
        {activeTab === 'moderation' && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-xl font-bold">Community Content Moderation</h2>
              <p className="text-xs text-muted-foreground">Review posts flagged by users for safety violations</p>
            </div>

            {reportedPosts.length > 0 ? (
              <div className="space-y-4">
                {reportedPosts.map((post) => (
                  <div key={post._id} className="p-6 rounded-3xl bg-card border border-amber-500/30 shadow-lg space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          <Flag className="w-3 h-3" /> {post.reports?.length || 1} Report(s)
                        </span>
                        <h4 className="font-bold text-sm text-foreground mt-2">Author: {post.user?.name} ({post.user?.email})</h4>
                        <p className="text-xs text-muted-foreground">Posted: {new Date(post.createdAt).toLocaleString()}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleDismissReport(post._id)} className="text-xs">
                          <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Dismiss Reports
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleModerateStatus(post._id, 'hidden')} className="text-xs">
                          <X className="w-3.5 h-3.5 mr-1" /> Hide Post
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-xs text-foreground/90 leading-relaxed">
                      {post.content}
                    </div>

                    {post.reports && post.reports.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs">
                        <span className="font-bold text-muted-foreground block text-[11px]">User Report Reasons:</span>
                        {post.reports.map((r: any, idx: number) => (
                          <div key={idx} className="p-2 rounded-xl bg-white/5 flex items-center justify-between text-xs">
                            <span className="text-amber-400 font-semibold uppercase text-[10px]">{r.reason}</span>
                            <span className="text-muted-foreground">{r.details || 'No additional details'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-card rounded-3xl border border-white/10 text-muted-foreground space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-base font-bold text-foreground">Clean Moderation Queue</p>
                <p className="text-xs">No community posts currently flagged for safety review.</p>
              </div>
            )}
          </div>
        )}

        {/* 3. TOURS & SLOTS TAB */}
        {activeTab === 'tours' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Food Walking Tours & Slots</h2>
                <p className="text-xs text-muted-foreground">Manage tour schedules, time slots, and participant rosters</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {toursList.map((tour) => (
                <div key={tour._id} className="p-6 rounded-3xl bg-card border border-white/10 shadow-md space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-base text-foreground">{tour.title}</h3>
                      <p className="text-xs text-muted-foreground">{tour.city} • ₹{tour.price} per person</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleViewParticipants(tour._id)} className="text-xs">
                      View Roster
                    </Button>
                  </div>

                  {/* Slots list */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground">Available Time Slots:</span>
                      <Button size="sm" variant="ghost" onClick={() => setNewSlotTourId(tour._id)} className="h-7 text-xs text-primary">
                        + Add Slot
                      </Button>
                    </div>

                    {tour.slots && tour.slots.length > 0 ? (
                      <div className="space-y-2">
                        {tour.slots.map((slot: any) => (
                          <div key={slot._id} className="p-3 rounded-2xl bg-white/5 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-foreground">{slot.startTime}</span>
                              <span className="text-muted-foreground ml-2">({new Date(slot.date).toLocaleDateString()})</span>
                              <p className="text-[10px] text-emerald-400 mt-0.5">
                                {slot.bookedSeats || 0} / {slot.capacity} seats booked
                              </p>
                            </div>
                            <Button size="icon" variant="ghost" onClick={() => handleDeleteSlot(tour._id, slot._id)} className="h-7 w-7 text-destructive">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground py-2">No slots added yet.</p>
                    )}
                  </div>

                  {/* Inline Slot Creator */}
                  {newSlotTourId === tour._id && (
                    <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-[10px]">Date</Label>
                          <Input type="date" value={newSlotDate} onChange={e => setNewSlotDate(e.target.value)} className="h-8 text-xs" />
                        </div>
                        <div>
                          <Label className="text-[10px]">Start Time</Label>
                          <Input value={newSlotTime} onChange={e => setNewSlotTime(e.target.value)} placeholder="10:00 AM" className="h-8 text-xs" />
                        </div>
                        <div>
                          <Label className="text-[10px]">Capacity</Label>
                          <Input type="number" value={newSlotCapacity} onChange={e => setNewSlotCapacity(Number(e.target.value))} className="h-8 text-xs" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setNewSlotTourId(null)} className="h-7 text-xs">Cancel</Button>
                        <Button size="sm" onClick={() => handleAddSlot(tour._id)} className="h-7 text-xs">Publish Slot</Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Participants Roster Dialog */}
            <Dialog open={!!selectedTourParticipants} onOpenChange={() => setSelectedTourParticipants(null)}>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Tour Participant Roster</DialogTitle>
                  <DialogDescription>List of users who reserved tickets for this tour</DialogDescription>
                </DialogHeader>
                <div className="max-h-80 overflow-y-auto space-y-2 mt-4 custom-scrollbar">
                  {selectedTourParticipants && selectedTourParticipants.length > 0 ? (
                    selectedTourParticipants.map((b) => (
                      <div key={b._id} className="p-3 rounded-xl bg-white/5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-foreground">{b.userId?.name || 'Guest'}</p>
                          <p className="text-[11px] text-muted-foreground">{b.userId?.email} • {b.participantsCount || 1} Seat(s)</p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-primary">{b.ticketCode}</span>
                          <p className="text-[10px] text-emerald-400 capitalize">{b.status}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-6 text-xs text-muted-foreground">No bookings recorded yet.</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* 4. FOOD PLACES CRUD TAB */}
        {activeTab === 'food' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1 w-full flex gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    placeholder="Search food places..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Button onClick={() => { setEditingPlace(null); setFormData({}); setIsDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-1.5" /> Add Food Place
              </Button>
            </div>

            <div className="glass-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Area / City</TableHead>
                    <TableHead>Food Type</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Avg Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFoodPlaces.map((place) => (
                    <TableRow key={place._id}>
                      <TableCell className="font-bold">{place.name}</TableCell>
                      <TableCell>{place.area || place.city}</TableCell>
                      <TableCell className="capitalize">{place.foodType || 'restaurant'}</TableCell>
                      <TableCell>⭐ {place.rating || 4.0}</TableCell>
                      <TableCell>₹{place.averagePrice || 200}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(place)}>
                            <Edit className="w-4 h-4 text-primary" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeletePlace(place._id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Food Place Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingPlace ? 'Edit Food Place' : 'Create New Food Place'}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="col-span-2">
                    <Label>Name *</Label>
                    <Input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div>
                    <Label>Area</Label>
                    <Input value={formData.area || ''} onChange={e => setFormData({ ...formData, area: e.target.value })} placeholder="Alkapuri" />
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input value={formData.city || 'Vadodara'} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                  </div>
                  <div>
                    <Label>Food Type</Label>
                    <Input value={formData.foodType || ''} onChange={e => setFormData({ ...formData, foodType: e.target.value })} placeholder="restaurant / cafe / street food" />
                  </div>
                  <div>
                    <Label>Average Price (for two)</Label>
                    <Input type="number" value={formData.averagePrice || ''} onChange={e => setFormData({ ...formData, averagePrice: Number(e.target.value) })} />
                  </div>
                  <div className="col-span-2">
                    <Label>Famous Specialty Dish</Label>
                    <Input value={formData.famousDish || ''} onChange={e => setFormData({ ...formData, famousDish: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <Label>Image URL</Label>
                    <Input value={formData.image || ''} onChange={e => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmitPlace}>Save Changes</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* 5. USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex gap-4">
              <Input
                placeholder="Search by name or email..."
                value={userSearchTerm}
                onChange={e => setUserSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>

            <div className="glass-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell className="font-bold">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-white/10'}`}>
                          {u.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" onClick={() => handleUserEdit(u)}>
                          <Edit className="w-4 h-4 text-primary" />
                        </Button>
                        {u._id !== user?.id && (
                          <Button size="icon" variant="ghost" onClick={() => handleUserDelete(u._id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit User Role</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Name</Label>
                    <Input value={userFormData.name || ''} onChange={e => setUserFormData({ ...userFormData, name: e.target.value })} />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select value={userFormData.role || 'user'} onValueChange={(val: any) => setUserFormData({ ...userFormData, role: val })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleUserSubmit}>Save User</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
