import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi, adminApi, famousPlaceApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Utensils, MapPin, Plus, Edit, Trash2, Search,
  LogOut, Home, Settings, BarChart3, Users, UserCog, Image as ImageIcon,
  Map, Star, X
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
  DialogTrigger,
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

interface FoodPlace {
  _id: string;
  name: string;
  city: string;
  state?: string;
  area?: string;
  address?: string;
  foodType?: string;
  category?: string;
  isVeg?: boolean;
  averagePrice?: number;
  famousDish?: string;
  rating?: number;
  latitude?: number;
  longitude?: number;
  image?: string;
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
  locations: FamousLocation[];
}

const AdminDashboard = () => {
  const [user, setUser] = useState<{ id: string; name: string; email: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'food' | 'users' | 'famous'>('food');

  // Food Places State
  const [foodPlaces, setFoodPlaces] = useState<FoodPlace[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<FoodPlace | null>(null);
  const [formData, setFormData] = useState<Partial<FoodPlace>>({});

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
  // Temp state for adding a nested location
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
              description: "Admin access required",
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
      } catch (error) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate, toast]);

  const loadData = async () => {
    try {
      if (activeTab === 'food') {
        const [foodPlacesRes, locationsRes] = await Promise.all([
          adminApi.getAllFoodPlaces(),
          adminApi.getAllLocations(),
        ]);

        if (foodPlacesRes.success) {
          setFoodPlaces((foodPlacesRes.data || []) as FoodPlace[]);
        }
        if (locationsRes.success) {
          setLocations((locationsRes.data || []) as string[]);
        }
      } else if (activeTab === 'famous') {
        const response = await famousPlaceApi.getAll();
        if (response.success) {
          setFamousPlaces((response.data || []) as FamousPlace[]);
        }
      } else {
        const [usersRes, statsRes] = await Promise.all([
          adminApi.getAllUsers(),
          adminApi.getUserStats(),
        ]);

        if (usersRes.success) {
          setUsers((usersRes.data || []) as User[]);
        }
        if (statsRes.success) {
          setUserStats((statsRes.data || { total: 0, admins: 0, users: 0 }) as any);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
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
    toast({
      title: "Logged out",
      description: "See you soon!",
    });
    navigate("/login");
  };

  const handleCreate = () => {
    setEditingPlace(null);
    setFormData({
      name: '',
      city: '',
      state: '',
      area: '',
      address: '',
      foodType: 'restaurant',
      category: '',
      isVeg: true,
      averagePrice: 0,
      famousDish: '',
      rating: 0,
      image: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (place: FoodPlace) => {
    setEditingPlace(place);
    setFormData(place);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this food place?')) return;

    try {
      const response = await adminApi.deleteFoodPlace(id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Food place deleted successfully",
        });
        loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete food place",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name || !formData.city) {
      toast({
        title: "Validation Error",
        description: "Name and City are required fields",
        variant: "destructive",
      });
      return;
    }

    if (!formData.image) {
      toast({
        title: "Validation Error",
        description: "Image URL is required",
        variant: "destructive",
      });
      return;
    }

    try {
      let response;
      if (editingPlace) {
        response = await adminApi.updateFoodPlace(editingPlace._id, formData);
      } else {
        response = await adminApi.createFoodPlace(formData);
      }

      if (response.success) {
        toast({
          title: "Success",
          description: editingPlace ? "Food place updated successfully" : "Food place created successfully",
        });
        setIsDialogOpen(false);
        loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: editingPlace ? "Failed to update food place" : "Failed to create food place",
        variant: "destructive",
      });
    }
  };

  const handleUserEdit = (userData: User) => {
    setEditingUser(userData);
    setUserFormData({
      name: userData.name,
      email: userData.email,
      role: userData.role,
    });
    setIsUserDialogOpen(true);
  };

  const handleUserDelete = async (id: string) => {
    if (id === user?.id) {
      toast({
        title: "Error",
        description: "Cannot delete your own account",
        variant: "destructive",
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await adminApi.deleteUser(id);
      if (response.success) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleUserSubmit = async () => {
    try {
      const response = await adminApi.updateUser(editingUser!._id, userFormData);
      if (response.success) {
        toast({
          title: "Success",
          description: "User updated successfully",
        });
        setIsUserDialogOpen(false);
        loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  // Famous Places Handlers
  const handleFamousCreate = () => {
    setEditingFamous(null);
    setFamousFormData({
      dishName: '',
      description: '',
      imageUrl: '',
      locations: []
    });
    setTempLocation({});
    setIsAddingLocation(false);
    setIsFamousDialogOpen(true);
  };

  const handleFamousEdit = (place: FamousPlace) => {
    setEditingFamous(place);
    setFamousFormData(JSON.parse(JSON.stringify(place))); // Deep copy
    setTempLocation({});
    setIsAddingLocation(false);
    setIsFamousDialogOpen(true);
  };

  const handleFamousDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this famous dish?')) return;
    try {
      const response = await famousPlaceApi.delete(id);
      if (response.success) {
        toast({ title: "Success", description: "Deleted successfully" });
        loadData();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const handleFamousSubmit = async () => {
    if (!famousFormData.dishName || !famousFormData.imageUrl) {
      toast({ title: "Validation Error", description: "Dish Name and Image are required", variant: "destructive" });
      return;
    }
    try {
      let response;
      if (editingFamous) {
        response = await famousPlaceApi.update(editingFamous._id, famousFormData);
      } else {
        response = await famousPlaceApi.create(famousFormData);
      }

      if (response.success) {
        toast({ title: "Success", description: "Saved successfully" });
        setIsFamousDialogOpen(false);
        loadData();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save", variant: "destructive" });
    }
  };

  const addNestedLocation = () => {
    if (!tempLocation.name || !tempLocation.latitude || !tempLocation.longitude) {
      toast({ title: "Error", description: "Name and Coordinates are required for location", variant: "destructive" });
      return;
    }
    const newLoc = { ...tempLocation, city: tempLocation.city || 'Vadodara' } as FamousLocation;
    setFamousFormData({
      ...famousFormData,
      locations: [...(famousFormData.locations || []), newLoc]
    });
    setTempLocation({});
    setIsAddingLocation(false);
  };

  const removeNestedLocation = (index: number) => {
    const updated = [...(famousFormData.locations || [])];
    updated.splice(index, 1);
    setFamousFormData({ ...famousFormData, locations: updated });
  };


  const filteredFoodPlaces = foodPlaces.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.famousDish?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || place.city === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  const filteredUsers = users.filter(userData => {
    const matchesSearch = userData.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      userData.email.toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || userData.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const filteredFamousPlaces = famousPlaces.filter(place =>
    place.dishName.toLowerCase().includes(famousSearchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">Manage Food Places, Locations & Users</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link to="/dashboard">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="glass-card p-2 mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('food')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'food'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Utensils className="w-4 h-4" />
              Food Places
            </div>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'users'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </div>
          </button>
          <button
            onClick={() => setActiveTab('famous')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'famous'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Star className="w-4 h-4" />
              Famous Foods
            </div>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {activeTab === 'food' ? (
            <>
              <div className="glass-card p-6">
                <div className="flex items-center gap-3">
                  <Utensils className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{foodPlaces.length}</p>
                    <p className="text-sm text-muted-foreground">Food Places</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-8 h-8 text-accent" />
                  <div>
                    <p className="text-2xl font-bold">{locations.length}</p>
                    <p className="text-sm text-muted-foreground">Locations</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-6">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{filteredFoodPlaces.length}</p>
                    <p className="text-sm text-muted-foreground">Filtered Results</p>
                  </div>
                </div>
              </div>
            </>
          ) : activeTab === 'famous' ? (
            <div className="glass-card p-6 md:col-span-3">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{famousPlaces.length}</p>
                  <p className="text-sm text-muted-foreground">Famous Dishes</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="glass-card p-6">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{userStats.total}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-6">
                <div className="flex items-center gap-3">
                  <UserCog className="w-8 h-8 text-accent" />
                  <div>
                    <p className="text-2xl font-bold">{userStats.admins}</p>
                    <p className="text-sm text-muted-foreground">Admins</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-6">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{filteredUsers.length}</p>
                    <p className="text-sm text-muted-foreground">Filtered Results</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Food Places Section */}
        {activeTab === 'food' && (
          <>
            {/* Filters and Actions */}
            <div className="glass-card p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <Label>Search</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, city, or dish..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Label>Location</Label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleCreate} className="w-full md:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Food Place
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingPlace ? 'Edit Food Place' : 'Create Food Place'}</DialogTitle>
                      <DialogDescription>
                        {editingPlace ? 'Update the food place details' : 'Add a new food place to the database'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label>Name *</Label>
                        <Input
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Restaurant/Cafe name"
                        />
                      </div>
                      <div>
                        <Label>City *</Label>
                        <Input
                          value={formData.city || ''}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="City name"
                        />
                      </div>
                      <div>
                        <Label>State</Label>
                        <Input
                          value={formData.state || ''}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          placeholder="State"
                        />
                      </div>
                      <div>
                        <Label>Area</Label>
                        <Input
                          value={formData.area || ''}
                          onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                          placeholder="Area/Locality"
                        />
                      </div>
                      <div>
                        <Label>Address</Label>
                        <Textarea
                          value={formData.address || ''}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="Full address"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>Food Type</Label>
                        <Select
                          value={formData.foodType || 'restaurant'}
                          onValueChange={(value) => setFormData({ ...formData, foodType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="street food">Street Food</SelectItem>
                            <SelectItem value="restaurant">Restaurant</SelectItem>
                            <SelectItem value="cafe">Cafe</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Input
                          value={formData.category || ''}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          placeholder="e.g., Gujarati, North Indian"
                        />
                      </div>
                      <div>
                        <Label>Famous Dish</Label>
                        <Input
                          value={formData.famousDish || ''}
                          onChange={(e) => setFormData({ ...formData, famousDish: e.target.value })}
                          placeholder="Signature dish"
                        />
                      </div>
                      <div>
                        <Label>Average Price (₹)</Label>
                        <Input
                          type="number"
                          value={formData.averagePrice || ''}
                          onChange={(e) => setFormData({ ...formData, averagePrice: Number(e.target.value) })}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>Rating</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          value={formData.rating || ''}
                          onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                          placeholder="0-5"
                        />
                      </div>
                      <div>
                        <Label>Latitude</Label>
                        <Input
                          type="number"
                          step="0.000001"
                          value={formData.latitude || ''}
                          onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                          placeholder="e.g., 22.3072"
                        />
                      </div>
                      <div>
                        <Label>Longitude</Label>
                        <Input
                          type="number"
                          step="0.000001"
                          value={formData.longitude || ''}
                          onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                          placeholder="e.g., 73.1812"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="image-url" className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          Image URL *
                        </Label>
                        <Input
                          id="image-url"
                          type="url"
                          value={formData.image || ''}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="mt-2"
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Enter a URL to an image of the food place or dish (e.g., Unsplash, Imgur, etc.)
                        </p>
                        {formData.image && (
                          <div className="mt-3 relative">
                            <img
                              src={formData.image}
                              alt="Preview"
                              className="w-full h-48 object-cover rounded-lg border border-border"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const errorDiv = document.createElement('div');
                                errorDiv.textContent = 'Failed to load image. Please check the URL.';
                                target.parentElement?.appendChild(errorDiv);
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.isVeg ?? true}
                            onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                            className="w-4 h-4"
                          />
                          Vegetarian
                        </Label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSubmit}>
                        {editingPlace ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Food Places Table */}
            <div className="glass-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFoodPlaces.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No food places found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFoodPlaces.map((place) => (
                      <TableRow key={place._id}>
                        <TableCell>
                          {place.image ? (
                            <div className="relative">
                              <img
                                src={place.image}
                                alt={place.name}
                                className="w-16 h-16 object-cover rounded-lg border border-border"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 flex items-center justify-center rounded-lg border border-muted bg-muted/50">
                              <ImageIcon className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{place.name}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{place.city}</div>
                            {place.area && <div className="text-muted-foreground">{place.area}</div>}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{place.foodType || '-'}</TableCell>
                        <TableCell>{place.category || '-'}</TableCell>
                        <TableCell>₹{place.averagePrice || 0}</TableCell>
                        <TableCell>{place.rating || 0}/5</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(place)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(place._id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {/* Famous Foods Section */}
        {activeTab === 'famous' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between glass-card p-6">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search famous dishes..."
                  className="pl-10"
                  value={famousSearchTerm}
                  onChange={(e) => setFamousSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={handleFamousCreate}><Plus className="w-4 h-4 mr-2" /> Add Famous Dish</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFamousPlaces.map(place => (
                <div key={place._id} className="glass-card p-4 flex flex-col gap-4">
                  <div className="relative h-40 rounded-lg overflow-hidden">
                    <img src={place.imageUrl} alt={place.dishName} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => handleFamousEdit(place)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleFamousDelete(place._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{place.dishName}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{place.description}</p>
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{place.locations.length} Locations added</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Dialog open={isFamousDialogOpen} onOpenChange={setIsFamousDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingFamous ? 'Edit Famous Dish' : 'New Famous Dish'}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Dish Name</Label>
                      <Input value={famousFormData.dishName} onChange={e => setFamousFormData({ ...famousFormData, dishName: e.target.value })} />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={famousFormData.description} onChange={e => setFamousFormData({ ...famousFormData, description: e.target.value })} />
                    </div>
                    <div>
                      <Label>Image URL</Label>
                      <Input value={famousFormData.imageUrl} onChange={e => setFamousFormData({ ...famousFormData, imageUrl: e.target.value })} />
                    </div>
                    {famousFormData.imageUrl && (
                      <img src={famousFormData.imageUrl} className="h-40 w-full object-cover rounded-md" />
                    )}
                  </div>

                  <div className="space-y-4 border-l pl-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Locations ({famousFormData.locations?.length || 0})</h4>
                      <Button size="sm" variant="outline" onClick={() => setIsAddingLocation(prev => !prev)}>
                        {isAddingLocation ? 'Cancel' : 'Add Location'}
                      </Button>
                    </div>

                    {isAddingLocation && (
                      <div className="p-4 border rounded-lg bg-secondary/10 space-y-3">
                        <Input placeholder="Place Name (e.g. Mahakali)" value={tempLocation.name || ''} onChange={e => setTempLocation({ ...tempLocation, name: e.target.value })} />
                        <Input placeholder="Full Address" value={tempLocation.address || ''} onChange={e => setTempLocation({ ...tempLocation, address: e.target.value })} />
                        <div className="grid grid-cols-2 gap-2">
                          <Input placeholder="Latitude" type="number" value={tempLocation.latitude || ''} onChange={e => setTempLocation({ ...tempLocation, latitude: Number(e.target.value) })} />
                          <Input placeholder="Longitude" type="number" value={tempLocation.longitude || ''} onChange={e => setTempLocation({ ...tempLocation, longitude: Number(e.target.value) })} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input placeholder="Area" value={tempLocation.area || ''} onChange={e => setTempLocation({ ...tempLocation, area: e.target.value })} />
                          <Input placeholder="Rating (0-5)" type="number" value={tempLocation.rating || ''} onChange={e => setTempLocation({ ...tempLocation, rating: Number(e.target.value) })} />
                        </div>
                        <Button size="sm" onClick={addNestedLocation} className="w-full">Confirm Add Location</Button>
                      </div>
                    )}

                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {famousFormData.locations?.map((loc, idx) => (
                        <div key={idx} className="flex justify-between items-start p-3 border rounded-md bg-background">
                          <div>
                            <p className="font-medium">{loc.name}</p>
                            <p className="text-xs text-muted-foreground">{loc.address}</p>
                            <div className="flex gap-2 text-xs mt-1">
                              <span className="bg-primary/10 text-primary px-1 rounded">{loc.rating} ★</span>
                              <span>{loc.area}</span>
                            </div>
                          </div>
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => removeNestedLocation(idx)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsFamousDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleFamousSubmit}>Save Changes</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Users Section */}
        {activeTab === 'users' && (
          <>
            {/* Filters */}
            <div className="glass-card p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <Label>Search</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Label>Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="glass-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((userData) => (
                      <TableRow key={userData._id}>
                        <TableCell className="font-medium">{userData.name}</TableCell>
                        <TableCell>{userData.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${userData.role === 'admin'
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted text-muted-foreground'
                            }`}>
                            {userData.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {userData.createdAt
                            ? new Date(userData.createdAt).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUserEdit(userData)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {userData._id !== user?.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUserDelete(userData._id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Edit User Dialog */}
            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit User</DialogTitle>
                  <DialogDescription>
                    Update user details and role
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-4 mt-4">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={userFormData.name || ''}
                      onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                      placeholder="User name"
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={userFormData.email || ''}
                      onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select
                      value={userFormData.role || 'user'}
                      onValueChange={(value: 'user' | 'admin') => setUserFormData({ ...userFormData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUserSubmit}>
                    Update User
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;

