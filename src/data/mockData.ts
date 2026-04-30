import { Compass, Users, MapPin, Dices, User } from 'lucide-react';

// ============= TYPES =============
export interface MapPinType {
    id: number;
    name: string;
    type: 'famous' | 'hidden';
    x: number;
    y: number;
    lat?: number;
    lng?: number;
    area?: string;
}

// ============= DATA =============
export const famousFoods = [
    { id: 1, name: 'Sev Usal', restaurant: 'Raju Dabeli', area: 'Alkapuri', isVeg: true, priceRange: '50-80', rating: 4.6, badge: 'famous' as const, image: '/images/SevUsal.png' },
    { id: 2, name: 'Khaman Dhokla', restaurant: 'Das Khaman House', area: 'Sayajigunj', isVeg: true, priceRange: '40-60', rating: 4.8, badge: 'famous' as const, image: '/images/mixed_khaman_platter.png' },
    { id: 3, name: 'Dabeli and Vadapav', restaurant: 'Day Night Vadapav', area: 'Sardar Estate', isVeg: true, priceRange: '20-50', rating: 4.4, badge: 'famous' as const, image: '/images/dabeli_vadapav.png' },
    { id: 4, name: 'Paneer Tikka', restaurant: 'Mandap Restaurant', area: 'Race Course', isVeg: true, priceRange: '180-250', rating: 4.4, badge: 'famous' as const, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop' },
];

export const famousRestaurantsArray = [
    { id: 101, name: 'Sasuma', restaurant: 'Gujarati Thali', area: 'Alkapuri', isVeg: true, priceRange: '300-500', rating: 4.8, badge: 'famous' as const, image: '/images/sasuma.webp', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Sasuma+Gujarati+Thali+Alkapuri+Vadodara' },
    { id: 102, name: 'Mandap Restaurant', restaurant: 'Gujarati & Kathiyawadi', area: 'Race Course', isVeg: true, priceRange: '400-600', rating: 4.6, badge: 'famous' as const, image: '/images/mandap_v2.jpg', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Mandap+Restaurant+Express+Towers+Vadodara' },
    { id: 109, name: 'Little Italy', restaurant: 'Authentic Vegetarian Italian', area: 'Alkapuri', isVeg: true, priceRange: '600-1000', rating: 4.7, badge: 'famous' as const, image: '/images/little-italy.jpg', topLabel: 'ICONIC ITALIAN DINING', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Little+Italy+Vadodara' },
    { id: 103, name: 'That Place', restaurant: 'Multi-cuisine', area: 'Alkapuri', isVeg: false, priceRange: '800-1500', rating: 4.5, badge: 'famous' as const, image: '/images/that-place.webp', mapUrl: 'https://www.google.com/maps/search/?api=1&query=That+Place+Alkapuri+Vadodara' },
    { id: 104, name: '0265 Burgers', restaurant: 'Burgers & Fast Food', area: 'Fatehgunj', isVeg: false, priceRange: '200-500', rating: 4.4, badge: 'famous' as const, image: '/images/0265-burger.jpg', mapUrl: 'https://www.google.com/maps/search/?api=1&query=0265+Burgers+Fatehgunj+Vadodara' },
    { id: 105, name: 'Peshawri', restaurant: 'North Indian', area: 'Welcome Hotel', isVeg: false, priceRange: '2000-4000', rating: 4.9, badge: 'famous' as const, image: '/images/peshwari.jpg', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Peshawri+WelcomHotel+Vadodara' },
    { id: 106, name: 'La Benito', restaurant: 'Cafe & Italian', area: 'Sayajigunj', isVeg: true, priceRange: '400-800', rating: 4.3, badge: 'famous' as const, image: '/images/la-benito.webp', mapUrl: 'https://www.google.com/maps/search/?api=1&query=La+Benito+Sayajigunj+Vadodara' },
    { id: 107, name: 'Kai Asia', restaurant: 'Asian Cuisine', area: 'Akota', isVeg: false, priceRange: '600-1200', rating: 4.6, badge: 'famous' as const, image: '/images/kai-asia.jpg', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Kai+Asia+Akota+Vadodara' },
    { id: 108, name: 'Swagat Restaurant', restaurant: 'Punjabi & North Indian', area: 'Sayajigunj', isVeg: true, priceRange: '300-600', rating: 4.5, badge: 'famous' as const, image: '/images/swagat.webp', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Swagat+Restaurant+Sayajigunj+Vadodara' },
];

export const hiddenGems = [
    { id: 5, name: 'New Samrat Colddrink', restaurant: 'Ice Cream & Milkshakes', area: 'Warasiya', isVeg: true, priceRange: '50-150', rating: 4.8, badge: 'hidden' as const, image: '/images/new-samrat.avif?v=1', imagePosition: 'top' as const },
    { id: 6, name: 'Woodbond Cafe', restaurant: 'Pizza & Cold Coffee', area: 'Gotri', isVeg: true, priceRange: '200-400', rating: 4.5, badge: 'hidden' as const, image: '/images/woodbond-cafe.avif?v=3' },
    { id: 7, name: 'Ustad Miya', restaurant: 'Ahmedabadi Tawa Fry', area: 'Alkapuri', isVeg: false, priceRange: '150-300', rating: 4.7, badge: 'hidden' as const, image: '/images/ustad-miya.webp' },
    { id: 8, name: 'Canara Coffee House', restaurant: 'Poona Misal & South Indian', area: 'Dandia Bazar', isVeg: true, priceRange: '50-150', rating: 4.6, badge: 'hidden' as const, image: '/images/canara-coffee.jpg' },
    { id: 9, name: 'Arabian Knife', restaurant: 'Shawarma & Alfaham', area: 'Vasna Road', isVeg: false, priceRange: '120-250', rating: 4.8, badge: 'hidden' as const, image: '/images/arabian-knife.avif' },
];

export const mapPins: MapPinType[] = [
    { id: 1, name: 'Raju Dabeli', type: 'famous', x: 25, y: 20, lat: 22.3072, lng: 73.1812, area: 'Alkapuri' },
    { id: 2, name: 'Das Khaman House', type: 'famous', x: 55, y: 35, lat: 22.3100, lng: 73.1900, area: 'Sayajigunj' },
    { id: 3, name: 'Shankar Farsan', type: 'famous', x: 40, y: 55, lat: 22.3050, lng: 73.1850, area: 'Fatehgunj' },
    { id: 4, name: 'Mandap Restaurant', type: 'famous', x: 70, y: 25, lat: 22.3120, lng: 73.1750, area: 'Race Course' },
    { id: 5, name: "Shyam's Corner", type: 'hidden', x: 15, y: 70, lat: 22.3000, lng: 73.1700, area: 'Panigate' },
    { id: 6, name: 'Khan Chacha', type: 'hidden', x: 85, y: 60, lat: 22.3150, lng: 73.1950, area: 'Waghodia Road' },
    { id: 7, name: 'Old City Kulfi', type: 'hidden', x: 35, y: 80, lat: 22.3020, lng: 73.1800, area: 'Raopura' },
];

export const moods = [
    { id: 'spicy', emoji: '🌶️', label: 'Spicy Cravings' },
    { id: 'comfort', emoji: '🏠', label: 'Comfort Food' },
    { id: 'party', emoji: '🎉', label: 'Party Mode' },
    { id: 'chill', emoji: '☕', label: 'Chill Vibes' },
    { id: 'healthy', emoji: '🥗', label: 'Healthy Bites' },
    { id: 'nosular', emoji: '🍲', label: 'Desi Meals' },
];

export const moodRecommendations: Record<string, { dish: string; place: string; rating: number; image: string }[]> = {
    spicy: [
        { dish: 'Pav Bhaji', place: 'Gopi Dining Hall', rating: 4.5, image: '🍛' },
        { dish: 'Schezwan Noodles', place: 'China Town', rating: 4.3, image: '🍜' },
        { dish: 'Misal Pav', place: 'Maratha Kitchen', rating: 4.6, image: '🥘' },
    ],
    comfort: [
        { dish: 'Dal Bati', place: 'Rajwadi Thali', rating: 4.7, image: '🫓' },
        { dish: 'Undhiyu', place: 'Havmor', rating: 4.4, image: '🥗' },
        { dish: 'Khichdi', place: 'Home Style Kitchen', rating: 4.5, image: '🍚' },
    ],
    party: [
        { dish: 'Tandoori Platter', place: 'Barbeque Nation', rating: 4.6, image: '🍗' },
        { dish: 'Pizza', place: 'Pizza Italia', rating: 4.4, image: '🍕' },
        { dish: 'Biryani', place: 'Paradise', rating: 4.8, image: '🍛' },
    ],
    chill: [
        { dish: 'Cold Coffee', place: 'Cafe Coffee Day', rating: 4.3, image: '☕' },
        { dish: 'Masala Chai', place: 'Chai Street', rating: 4.6, image: '🍵' },
        { dish: 'Croissant', place: 'French Loaf', rating: 4.5, image: '🥐' },
    ],
    healthy: [
        { dish: 'Sprouts Salad', place: 'Green Leaf', rating: 4.4, image: '🥗' },
        { dish: 'Smoothie Bowl', place: 'Juice Junction', rating: 4.5, image: '🫐' },
        { dish: 'Grilled Paneer', place: 'Fit Kitchen', rating: 4.3, image: '🧀' },
    ],
};

export const mockUser = {
    id: 'user-1',
    name: 'Foodie Explorer',
    email: 'foodie@example.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    role: 'user'
};

export const mockPosts = [
    {
        _id: 'post-1',
        author: { name: 'Riya Patel', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
        content: 'Just tried the amazing Sev Usal at Raju\'s! The spice level was perfect. 🌶️ #Foodie #Vadodara',
        image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&h=400&fit=crop',
        likes: ['user-2', 'user-3'],
        comments: [
            { _id: 'c1', author: { name: 'Amit Shah' }, content: 'Best in town!', createdAt: new Date().toISOString() }
        ],
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        tags: ['Sev Usal', 'Spicy']
    },
    {
        _id: 'post-2',
        author: { name: 'Arjun Singh', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop' },
        content: 'Found this hidden gem for puff lovers! 🥐',
        image: 'https://images.unsplash.com/photo-1558326567-98ae2405596b?w=600&h=400&fit=crop',
        likes: ['user-1'],
        comments: [],
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        tags: ['Puff', 'Snacks']
    }
];

export const mockFoodPlaces = mapPins.map(pin => ({
    _id: pin.id.toString(),
    name: pin.name,
    latitude: pin.lat,
    longitude: pin.lng,
    description: pin.area,
    images: [],
    rating: 4.5,
    address: pin.area
}));

export const navItems = [
    { id: 'discover', icon: Compass, label: 'Discover' },
    { id: 'community', icon: Users, label: 'Community' },
    { id: 'tours', icon: MapPin, label: 'Tours' },
    { id: 'roulette', icon: Dices, label: 'Roulette' },
    { id: 'profile', icon: User, label: 'Profile' },
];
