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

// ============= STATIC PLACE LOOKUP MAP =============
// Provides full data (including lat/lng, menu, description) for all static cards
// so the PlaceDetail page can render them without a backend query.
export const staticPlacesMap: Record<string | number, any> = {
    // Famous Foods
    1: { id: 1, name: 'Sev Usal', restaurant: 'Raju Dabeli', area: 'Alkapuri', city: 'Vadodara', isVeg: true, priceRange: '50-80', rating: 4.6, badge: 'famous', image: '/images/SevUsal.png', lat: 22.3093, lng: 73.1815, address: 'Alkapuri, Vadodara', description: 'Sev Usal is a beloved Gujarati street food — a spicy, tangy pea curry topped with crispy sev, diced onions, and zesty chutneys. A Vadodara staple that locals swear by.', menu: [ { itemName: 'Sev Usal', price: 50, description: 'Classic spicy pea curry with crunchy sev' }, { itemName: 'Sev Usal with Bread', price: 70, description: 'Served with buttered pav on the side' }, { itemName: 'Masala Chai', price: 15, description: 'Freshly brewed spiced tea' } ] },
    2: { id: 2, name: 'Khaman Dhokla', restaurant: 'Das Khaman House', area: 'Sayajigunj', city: 'Vadodara', isVeg: true, priceRange: '40-60', rating: 4.8, badge: 'famous', image: '/images/mixed_khaman_platter.png', lat: 22.3149, lng: 73.1925, address: 'Sayajigunj, Vadodara', description: 'Das Khaman House serves the fluffiest, most flavourful Khaman Dhokla in Vadodara. Steamed to perfection and tempered with mustard seeds and curry leaves.', menu: [ { itemName: 'Plain Khaman', price: 40, description: 'Classic soft steamed gram flour cake' }, { itemName: 'Mixed Khaman Platter', price: 60, description: 'Assorted khaman varieties with chutneys' }, { itemName: 'Fafda + Jalebi', price: 50, description: 'Crispy chickpea strips with sweet jalebis' } ] },
    3: { id: 3, name: 'Dabeli and Vadapav', restaurant: 'Day Night Vadapav', area: 'Sardar Estate', city: 'Vadodara', isVeg: true, priceRange: '20-50', rating: 4.4, badge: 'famous', image: '/images/dabeli_vadapav.png', lat: 22.3050, lng: 73.1870, address: 'Sardar Estate, Vadodara', description: 'Day Night Vadapav is an iconic stall that runs nearly around the clock, serving perfectly spiced vada pav and sweet-sour dabeli to hungry crowds at any hour.', menu: [ { itemName: 'Vada Pav', price: 20, description: 'Spiced potato fritter in soft pav' }, { itemName: 'Dabeli', price: 30, description: 'Tangy potato filling with peanuts and pomegranate' }, { itemName: 'Dry Garlic Chutney Vada Pav', price: 25, description: 'Extra spicy version with garlic chutney' } ] },
    4: { id: 4, name: 'Paneer Tikka', restaurant: 'Mandap Restaurant', area: 'Race Course', city: 'Vadodara', isVeg: true, priceRange: '180-250', rating: 4.4, badge: 'famous', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop', lat: 22.3117, lng: 73.1778, address: 'Express Towers, Race Course, Vadodara', description: 'Mandap is one of the finest dining institutions in Vadodara. Their Paneer Tikka is marinated in secret spices and grilled in a clay tandoor for a smoky, charred finish.', menu: [ { itemName: 'Paneer Tikka', price: 220, description: 'Marinated cottage cheese grilled in tandoor' }, { itemName: 'Gujarati Thali', price: 380, description: 'Unlimited authentic Gujarati meal' }, { itemName: 'Dal Dhokli', price: 150, description: 'Wheat noodles in spiced lentil soup' } ] },
    // Famous Restaurants
    101: { id: 101, name: 'Sasuma', restaurant: 'Gujarati Thali', area: 'Alkapuri', city: 'Vadodara', isVeg: true, priceRange: '300-500', rating: 4.8, badge: 'famous', image: '/images/sasuma.webp', lat: 22.3072, lng: 73.1812, address: 'Alkapuri, Vadodara', description: 'Sasuma is renowned for its traditional Gujarati thali — an all-you-can-eat feast that captures the warmth of home-cooked Gujarati cuisine. Every meal ends with a generous serving of shrikhand.', menu: [ { itemName: 'Unlimited Thali', price: 400, description: 'Full Gujarati thali with 20+ items' }, { itemName: 'Shrikhand', price: 80, description: 'Sweetened strained yogurt dessert' }, { itemName: 'Kadhi Khichdi', price: 180, description: 'Classic Gujarati comfort food' } ] },
    102: { id: 102, name: 'Mandap Restaurant', restaurant: 'Gujarati & Kathiyawadi', area: 'Race Course', city: 'Vadodara', isVeg: true, priceRange: '400-600', rating: 4.6, badge: 'famous', image: '/images/mandap_v2.jpg', lat: 22.3117, lng: 73.1778, address: 'Express Towers, Race Course Road, Vadodara', description: 'Mandap is a Vadodara landmark. With its Rajasthani décor and award-winning Gujarati-Kathiyawadi menu, it has been the go-to for family dinners and celebrations for decades.', menu: [ { itemName: 'Undhiyu', price: 220, description: 'Seasonal Gujarati mixed vegetable curry' }, { itemName: 'Paneer Tikka', price: 250, description: 'Tandoor grilled cottage cheese' }, { itemName: 'Kathiyawadi Thali', price: 550, description: 'Unlimited spicy Kathiyawadi meal' } ] },
    109: { id: 109, name: 'Little Italy', restaurant: 'Authentic Vegetarian Italian', area: 'Alkapuri', city: 'Vadodara', isVeg: true, priceRange: '600-1000', rating: 4.7, badge: 'famous', image: '/images/little-italy.jpg', lat: 22.3085, lng: 73.1820, address: 'Alkapuri, Vadodara', description: "Little Italy brings a little piece of Italy to Vadodara. Known for their thin-crust pizzas and homemade pastas, it's the most authentic vegetarian Italian dining experience in the city.", menu: [ { itemName: 'Margherita Pizza', price: 380, description: 'Classic tomato, mozzarella, and fresh basil' }, { itemName: 'Spaghetti Aglio e Olio', price: 350, description: 'Pasta with garlic, olive oil, and chili flakes' }, { itemName: 'Tiramisu', price: 220, description: 'Italian coffee dessert with mascarpone' } ] },
    103: { id: 103, name: 'That Place', restaurant: 'Multi-cuisine', area: 'Alkapuri', city: 'Vadodara', isVeg: false, priceRange: '800-1500', rating: 4.5, badge: 'famous', image: '/images/that-place.webp', lat: 22.3078, lng: 73.1830, address: 'Alkapuri, Vadodara', description: "That Place is Vadodara's trendiest multi-cuisine restaurant. With its chic industrial interior and global menu, it caters to adventurous palates looking for something beyond the ordinary.", menu: [ { itemName: 'Truffle Fries', price: 280, description: 'Crispy fries tossed in truffle oil and parmesan' }, { itemName: 'Butter Garlic Prawns', price: 480, description: 'Jumbo prawns in herb butter sauce' }, { itemName: 'Molten Lava Cake', price: 250, description: 'Warm chocolate cake with liquid center' } ] },
    104: { id: 104, name: '0265 Burgers', restaurant: 'Burgers & Fast Food', area: 'Fatehgunj', city: 'Vadodara', isVeg: false, priceRange: '200-500', rating: 4.4, badge: 'famous', image: '/images/0265-burger.jpg', lat: 22.3200, lng: 73.1810, address: 'Fatehgunj, Vadodara', description: '0265 Burgers (0265 is Vadodara\'s STD code) is a locally-owned burger joint serving giant, indulgent burgers with creative local twists. The beef patties are hand-pressed fresh daily.', menu: [ { itemName: 'Signature 0265 Burger', price: 280, description: 'Double patty with special house sauce' }, { itemName: 'Crispy Chicken Burger', price: 220, description: 'Crunchy fried chicken with coleslaw' }, { itemName: 'Loaded Cheese Fries', price: 150, description: 'Fries smothered in melted cheddar' } ] },
    105: { id: 105, name: 'Peshawri', restaurant: 'North Indian', area: 'Welcome Hotel', city: 'Vadodara', isVeg: false, priceRange: '2000-4000', rating: 4.9, badge: 'famous', image: '/images/peshwari.jpg', lat: 22.3050, lng: 73.1760, address: 'WelcomHotel, Vadodara', description: "Peshawri at WelcomHotel is Vadodara's most prestigious restaurant, faithfully recreating the robust flavours of the North-West frontier. A bucket-list dining experience.", menu: [ { itemName: 'Dal Bukhara', price: 850, description: 'Black lentils slow-cooked for 18 hours' }, { itemName: 'Tandoori Platter', price: 1200, description: 'Selection of prime tandoor-grilled meats' }, { itemName: 'Bread Basket', price: 350, description: 'Assorted Indian breads from the tandoor' } ] },
    106: { id: 106, name: 'La Benito', restaurant: 'Cafe & Italian', area: 'Sayajigunj', city: 'Vadodara', isVeg: true, priceRange: '400-800', rating: 4.3, badge: 'famous', image: '/images/la-benito.webp', lat: 22.3149, lng: 73.1900, address: 'Sayajigunj, Vadodara', description: 'La Benito is a cozy Italian café tucked in Sayajigunj. Famous for their wood-fired pizzas, home-baked breads, and specialty coffees — the perfect spot for a leisurely afternoon.', menu: [ { itemName: 'Wood-fired Pizza', price: 380, description: 'Thin-crust pizza from a real wood-fired oven' }, { itemName: 'Cold Brew Coffee', price: 180, description: '12-hour cold-steeped specialty coffee' }, { itemName: 'Focaccia', price: 150, description: 'Herb-infused Italian flatbread' } ] },
    107: { id: 107, name: 'Kai Asia', restaurant: 'Asian Cuisine', area: 'Akota', city: 'Vadodara', isVeg: false, priceRange: '600-1200', rating: 4.6, badge: 'famous', image: '/images/kai-asia.jpg', lat: 22.2990, lng: 73.1700, address: 'Akota, Vadodara', description: 'Kai Asia brings the flavours of Southeast Asia to Vadodara. With authentic Thai, Japanese, and Chinese dishes prepared by specialty chefs, it stands apart in the city\'s dining scene.', menu: [ { itemName: 'Thai Green Curry', price: 380, description: 'Coconut milk curry with fresh herbs' }, { itemName: 'Sushi Platter (8 pcs)', price: 480, description: 'Fresh assorted maki and nigiri rolls' }, { itemName: 'Pad Thai', price: 320, description: 'Stir-fried rice noodles with tamarind sauce' } ] },
    108: { id: 108, name: 'Swagat Restaurant', restaurant: 'Punjabi & North Indian', area: 'Sayajigunj', city: 'Vadodara', isVeg: true, priceRange: '300-600', rating: 4.5, badge: 'famous', image: '/images/swagat.webp', lat: 22.3149, lng: 73.1910, address: 'Sayajigunj, Vadodara', description: "Swagat has been serving hearty North Indian and Punjabi food for over three decades. Their butter-drenched dal makhani and fluffy naans keep regulars coming back week after week.", menu: [ { itemName: 'Dal Makhani', price: 200, description: 'Overnight slow-cooked black lentils' }, { itemName: 'Paneer Butter Masala', price: 250, description: 'Cottage cheese in rich tomato gravy' }, { itemName: 'Butter Naan', price: 50, description: 'Soft tandoor-baked buttered bread' } ] },
    // Hidden Gems
    5: { id: 5, name: 'New Samrat Colddrink', restaurant: 'Ice Cream & Milkshakes', area: 'Warasiya', city: 'Vadodara', isVeg: true, priceRange: '50-150', rating: 4.8, badge: 'hidden', image: '/images/new-samrat.avif?v=1', lat: 22.3350, lng: 73.2050, address: 'Warasiya Circle, Vadodara', description: 'New Samrat Colddrink is a beloved old-school ice cream parlour in Warasiya that has been serving generations of Vadodara families. Their homemade kulfi and fruit-based shakes are legendary.', menu: [ { itemName: 'Mango Shake', price: 80, description: 'Thick Alphonso mango milkshake' }, { itemName: 'Sitafal Ice Cream', price: 60, description: 'Custard apple flavoured local ice cream' }, { itemName: 'Pista Kulfi', price: 50, description: 'Traditional frozen dessert with pistachios' } ] },
    6: { id: 6, name: 'Woodbond Cafe', restaurant: 'Pizza & Cold Coffee', area: 'Gotri', city: 'Vadodara', isVeg: true, priceRange: '200-400', rating: 4.5, badge: 'hidden', image: '/images/woodbond-cafe.avif?v=3', lat: 22.3220, lng: 73.1650, address: 'Gotri Road, Vadodara', description: 'Woodbond Cafe is a charming neighbourhood hideaway in Gotri. With fairy lights, wood interiors, and perfectly-made cold coffees, it\'s the secret hangout spot for Vadodara\'s college crowd.', menu: [ { itemName: 'Woodbond Special Cold Coffee', price: 150, description: 'Their signature whipped cold coffee blend' }, { itemName: 'Wood-fired Margherita', price: 280, description: 'Classic pizza from their wood-fired oven' }, { itemName: 'Banana Nutella Waffle', price: 180, description: 'Crispy waffle with sliced banana and Nutella' } ] },
    7: { id: 7, name: 'Ustad Miya', restaurant: 'Ahmedabadi Tawa Fry', area: 'Alkapuri', city: 'Vadodara', isVeg: false, priceRange: '150-300', rating: 4.7, badge: 'hidden', image: '/images/ustad-miya.webp', lat: 22.3090, lng: 73.1800, address: 'Alkapuri, Vadodara', description: "Ustad Miya is a no-frills tawa fry stall that has earned cult status among Vadodara's meat-lovers. The Ahmedabadi-style tawa-fried mutton and chicken, sizzling on a large iron griddle, is a must-try.", menu: [ { itemName: 'Tawa Mutton Fry', price: 280, description: 'Spicy mutton fry on iron griddle' }, { itemName: 'Tawa Chicken', price: 220, description: 'Juicy chicken pieces with masala' }, { itemName: 'Rumali Roti', price: 30, description: 'Paper-thin soft flatbread' } ] },
    8: { id: 8, name: 'Canara Coffee House', restaurant: 'Poona Misal & South Indian', area: 'Dandia Bazar', city: 'Vadodara', isVeg: true, priceRange: '50-150', rating: 4.6, badge: 'hidden', image: '/images/canara-coffee.jpg', lat: 22.3020, lng: 73.1980, address: 'Dandia Bazar, Vadodara', description: "Canara Coffee House is one of Vadodara's oldest surviving coffee houses, dating back decades. Their strong filter coffee and fiery Pune-style Misal Pav are an institution in the old city.", menu: [ { itemName: 'Filter Coffee', price: 25, description: 'Strong South Indian drip coffee with milk' }, { itemName: 'Poona Misal', price: 80, description: 'Spicy sprouted curry with pav and farsan' }, { itemName: 'Idli', price: 50, description: 'Steamed rice cakes with sambar and coconut chutney' } ] },
    9: { id: 9, name: 'Arabian Knife', restaurant: 'Shawarma & Alfaham', area: 'Vasna Road', city: 'Vadodara', isVeg: false, priceRange: '120-250', rating: 4.8, badge: 'hidden', image: '/images/arabian-knife.avif', lat: 22.2950, lng: 73.1750, address: 'Vasna Road, Vadodara', description: "Arabian Knife is Vadodara's best-kept secret for Middle Eastern food. Their Chicken Alfaham (whole grilled chicken, Arabic style) and shawarma rolls are unlike anything else in the city.", menu: [ { itemName: 'Chicken Shawarma Roll', price: 130, description: 'Marinated chicken wrapped in soft Arabic bread' }, { itemName: 'Chicken Alfaham (Half)', price: 220, description: 'Whole Arabic-style grilled chicken, half portion' }, { itemName: 'Hummus with Pita', price: 120, description: 'Creamy chickpea dip with warm pita bread' } ] },
};

