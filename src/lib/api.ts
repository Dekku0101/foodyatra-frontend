/**
 * API Client for FoodYatra 2.0
 * Unified typed client for Authentication, Food Discovery, Zayka AI 2.0,
 * Personalization Engine, Food Journey, Tours & Ticketing, Community Moderation, and Analytics.
 */

const defaultDevUrl = 'http://localhost:5000/api';
const defaultProdUrl = typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api';
const rawApiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? defaultProdUrl : defaultDevUrl);
const API_BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`;

if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL);
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  count?: number;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
}

/**
 * Token utilities
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
};

/**
 * Universal authenticated API request wrapper
 */
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getToken();
  const fullUrl = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob)) {
    body = JSON.stringify(body);
  }

  try {
    const response = await fetch(fullUrl, {
      method: options.method || 'GET',
      headers,
      body: body || options.body,
      ...(options.signal && { signal: options.signal }),
      ...(options.credentials && { credentials: options.credentials }),
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    let data;
    try {
      data = await response.json();
    } catch {
      return {
        success: false,
        error: 'Invalid JSON response from server',
      };
    }

    return {
      ...data,
      success: data.success !== false,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
    return {
      success: false,
      error: errorMessage.includes('Failed to fetch')
        ? 'Connection Error: Is the backend server running?'
        : errorMessage,
    };
  }
};

/**
 * Backend Health Check
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/famous-places`, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * 1. Authentication API
 */
export const authApi = {
  register: async (name: string, email: string, password: string) => {
    const response = await apiRequest<{ user: any; token?: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }
    );
    if (response.success && response.token) {
      setToken(response.token);
    }
    return response;
  },

  login: async (email: string, password: string) => {
    const response = await apiRequest<{ token: string; user: any }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    if (response.success && response.token) {
      setToken(response.token);
    }
    return response;
  },

  getCurrentUser: async () => {
    return apiRequest<{ user: any }>('/auth/me', { method: 'GET' });
  },

  logout: () => {
    removeToken();
  },
};

/**
 * 2. Recommendations & Personalization API ("For You")
 */
export const recommendationsApi = {
  // Dynamic personalized "For You" engine
  getForYou: async () => {
    return apiRequest<any[]>('/recommendations/for-you', { method: 'GET' });
  },

  getMyRecommendations: async () => {
    return apiRequest<any[]>('/recommendations', { method: 'GET' });
  },

  getRecommendations: async (params?: any) => {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/recommendations${queryParams ? `?${queryParams}` : ''}`;
    return apiRequest(endpoint, { method: 'GET' });
  },
};

/**
 * 3. User Preferences API
 */
export const preferencesApi = {
  getPreferences: async () => {
    return apiRequest('/preferences', { method: 'GET' });
  },

  updatePreferences: async (preferences: any) => {
    return apiRequest('/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },
};

/**
 * 4. User Journey & Profile API
 */
export const userJourneyApi = {
  getJourney: async () => {
    return apiRequest<{
      user: any;
      personality: { title: string; icon: string; description: string };
      stats: { placesExplored: number; favoritesCount: number; searchesCount: number; toursBooked: number; totalActivities: number };
      favorites: any[];
      recentActivity: any[];
      cuisineBreakdown: { name: string; count: number }[];
      topAreas: { area: string; count: number }[];
      priceDistribution: { name: string; count: number }[];
    }>('/journey', { method: 'GET' });
  },

  toggleFavorite: async (data: {
    placeId?: string;
    placeType?: 'foodplace' | 'famousplace';
    name: string;
    image?: string;
    cuisine?: string;
    isVeg?: boolean;
    price?: number;
    rating?: number;
    area?: string;
  }) => {
    return apiRequest<{ isFavorited: boolean; favoritesCount: number; message: string }>(
      '/journey/favorites/toggle',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  trackActivity: async (data: {
    action: 'view' | 'search' | 'favorite' | 'roulette' | 'tour_booked' | 'share';
    targetId?: string;
    targetName?: string;
    category?: string;
    cuisine?: string;
    isVeg?: boolean;
    price?: number;
  }) => {
    return apiRequest('/journey/activity/track', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * 5. Food Places API (Discovery & Advanced Search)
 */
export const foodPlacesApi = {
  getAllFoodPlaces: async (params?: {
    city?: string;
    area?: string;
    foodType?: string;
    cuisine?: string;
    category?: string;
    isVeg?: string | boolean;
    maxPrice?: number;
    minRating?: number;
    price?: string;
    dish?: string;
    type?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.city) queryParams.append('city', params.city);
    if (params?.area) queryParams.append('area', params.area);
    if (params?.foodType) queryParams.append('foodType', params.foodType);
    if (params?.cuisine) queryParams.append('cuisine', params.cuisine);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.isVeg !== undefined) queryParams.append('isVeg', String(params.isVeg));
    if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params?.minRating) queryParams.append('minRating', params.minRating.toString());
    if (params?.price) queryParams.append('price', params.price);
    if (params?.dish) queryParams.append('dish', params.dish);
    if (params?.type) queryParams.append('type', params.type);

    const query = queryParams.toString();
    return apiRequest<any[]>(`/food-places${query ? `?${query}` : ''}`, { method: 'GET' });
  },

  getFoodPlaceById: async (id: string) => {
    return apiRequest<any>(`/food-places/${id}`, { method: 'GET' });
  },

  comparePlaces: async (placeIds: string[]) => {
    return apiRequest<{
      places: any[];
      verdict: string;
    }>('/food-places/compare', {
      method: 'POST',
      body: JSON.stringify({ placeIds }),
    });
  },
};

/**
 * 6. Famous Places (Iconic Heritage Dishes) API
 */
export const famousPlaceApi = {
  getAll: async (params?: { price?: string; type?: string; foodType?: string; isVeg?: string; city?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.price) queryParams.append('price', params.price);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.foodType) queryParams.append('foodType', params.foodType);
    if (params?.isVeg) queryParams.append('isVeg', params.isVeg);
    if (params?.city) queryParams.append('city', params.city);

    const query = queryParams.toString();
    return apiRequest<any[]>(`/famous-places${query ? `?${query}` : ''}`, { method: 'GET' });
  },

  getById: async (id: string) => {
    return apiRequest<any>(`/famous-places/${id}`, { method: 'GET' });
  },

  create: async (data: any) => {
    return apiRequest('/famous-places', { method: 'POST', body: JSON.stringify(data) });
  },

  update: async (id: string, data: any) => {
    return apiRequest(`/famous-places/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  delete: async (id: string) => {
    return apiRequest(`/famous-places/${id}`, { method: 'DELETE' });
  },
};

/**
 * 7. Food Walking Tours & Reservations API
 */
export const toursApi = {
  getAllTours: async (params?: { city?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.city) queryParams.append('city', params.city);
    const query = queryParams.toString();
    return apiRequest<any[]>(`/tours${query ? `?${query}` : ''}`, { method: 'GET' });
  },

  getTourById: async (id: string) => {
    return apiRequest<any>(`/tours/${id}`, { method: 'GET' });
  },
};

export const paymentsApi = {
  createSession: async (tourId: string, slotId?: string, participantsCount: number = 1) => {
    return apiRequest<{
      amountPaid?: number;
      data?: {
        bookingId: string;
        ticketCode: string;
        ticketUrl: string;
        participantsCount: number;
      };
    }>('/payments/create-session', {
      method: 'POST',
      body: JSON.stringify({ tourId, slotId, participantsCount }),
    });
  },

  getBookingById: async (bookingId: string) => {
    return apiRequest<any>(`/payments/booking/${bookingId}`, { method: 'GET' });
  },

  getMyBookings: async () => {
    return apiRequest<any[]>('/payments/my-bookings', { method: 'GET' });
  },

  cancelBooking: async (bookingId: string, reason?: string) => {
    return apiRequest(`/payments/booking/${bookingId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};

/**
 * 8. Community Social Feed & Moderation API
 */
export const postsApi = {
  getAllPosts: async () => {
    return apiRequest<any[]>('/posts', { method: 'GET' });
  },

  createPost: async (postData: { content: string; image?: string; hashtags?: string[] }) => {
    return apiRequest('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  toggleLike: async (postId: string) => {
    return apiRequest(`/posts/${postId}/like`, { method: 'POST' });
  },

  addComment: async (postId: string, content: string) => {
    return apiRequest(`/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  reportPost: async (postId: string, reason: string, details?: string) => {
    return apiRequest(`/posts/${postId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason, details }),
    });
  },

  sharePost: async (postId: string) => {
    return apiRequest(`/posts/${postId}/share`, { method: 'POST' });
  },

  deletePost: async (postId: string) => {
    return apiRequest(`/posts/${postId}`, { method: 'DELETE' });
  },
};

/**
 * 9. Zayka AI 2.0 API (Conversational RAG, Mood Engine, NL Search Parser)
 */
export const aiApi = {
  getRecommendations: async (data: { city: string; mood: string; budget?: string; foodType?: string }) => {
    return apiRequest<{
      city: string;
      mood: string;
      recommendations: any[];
      explanation: string;
    }>('/ai/recommend', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  chat: async (message: string) => {
    return apiRequest<{
      reply: string;
      parameters?: any;
      cards?: {
        id: string;
        name: string;
        subtitle: string;
        image: string;
        rating: number;
        price: string;
        type: string;
        foodType: string;
        isVeg: boolean;
        whyRecommended: string;
      }[];
    }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  parseFoodQuery: async (query: string) => {
    return apiRequest<{
      query: string;
      extracted: {
        intent: string;
        dietary: string;
        budget: string;
        maxPrice: number | null;
        spiceLevel: string;
        location: string | null;
        cuisine: string | null;
        foodType: string | null;
        mood: string | null;
      };
    }>('/ai/parse-food-query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  },
};

/**
 * 10. Admin Back-Office API
 */
export const adminApi = {
  // Analytics
  getAnalytics: async () => {
    return apiRequest<{
      kpis: {
        totalUsers: number;
        totalFoodPlaces: number;
        totalFamousPlaces: number;
        totalTours: number;
        totalBookings: number;
        totalPosts: number;
        totalFavoritesSaved: number;
        totalRevenue: number;
        reportedPostsCount: number;
      };
      foodTypeDistribution: { name: string; count: number }[];
      cuisineDistribution: { name: string; count: number }[];
      dietaryDistribution: { name: string; value: number }[];
      priceTierDistribution: { name: string; count: number }[];
      tourBookingsData: { name: string; participants: number }[];
      communityEngagement: {
        totalPosts: number;
        totalLikes: number;
        totalComments: number;
        totalShares: number;
        reportedPostsCount: number;
      };
      topEateries: any[];
      topDishes: any[];
    }>('/admin/analytics', { method: 'GET' });
  },

  // Community Moderation
  getReportedPosts: async () => {
    return apiRequest<any[]>('/admin/moderation/posts', { method: 'GET' });
  },

  dismissPostReports: async (postId: string) => {
    return apiRequest(`/admin/moderation/posts/${postId}/dismiss`, { method: 'PUT' });
  },

  updatePostModerationStatus: async (postId: string, status: 'active' | 'hidden' | 'flagged') => {
    return apiRequest(`/admin/moderation/posts/${postId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Food Places CRUD
  getAllFoodPlaces: async () => {
    return apiRequest('/admin/food-places', { method: 'GET' });
  },

  getFoodPlaceById: async (id: string) => {
    return apiRequest(`/admin/food-places/${id}`, { method: 'GET' });
  },

  createFoodPlace: async (foodPlace: any) => {
    return apiRequest('/admin/food-places', {
      method: 'POST',
      body: JSON.stringify(foodPlace),
    });
  },

  updateFoodPlace: async (id: string, foodPlace: any) => {
    return apiRequest(`/admin/food-places/${id}`, {
      method: 'PUT',
      body: JSON.stringify(foodPlace),
    });
  },

  deleteFoodPlace: async (id: string) => {
    return apiRequest(`/admin/food-places/${id}`, { method: 'DELETE' });
  },

  getAllLocations: async () => {
    return apiRequest('/admin/locations', { method: 'GET' });
  },

  getFoodPlacesByLocation: async (city: string) => {
    return apiRequest(`/admin/locations/${city}/food-places`, { method: 'GET' });
  },

  // User Management
  getAllUsers: async () => {
    return apiRequest('/admin/users', { method: 'GET' });
  },

  getUserStats: async () => {
    return apiRequest('/admin/users/stats', { method: 'GET' });
  },

  getUserById: async (id: string) => {
    return apiRequest(`/admin/users/${id}`, { method: 'GET' });
  },

  updateUser: async (id: string, userData: any) => {
    return apiRequest(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (id: string) => {
    return apiRequest(`/admin/users/${id}`, { method: 'DELETE' });
  },

  // Tours CRUD & Slot Management
  getAllTours: async () => {
    return apiRequest('/admin/tours', { method: 'GET' });
  },

  createTour: async (tour: any) => {
    return apiRequest('/admin/tours', { method: 'POST', body: JSON.stringify(tour) });
  },

  updateTour: async (id: string, tour: any) => {
    return apiRequest(`/admin/tours/${id}`, { method: 'PUT', body: JSON.stringify(tour) });
  },

  deleteTour: async (id: string) => {
    return apiRequest(`/admin/tours/${id}`, { method: 'DELETE' });
  },

  addTourSlot: async (tourId: string, slotData: { date: string | Date; startTime: string; capacity?: number }) => {
    return apiRequest(`/admin/tours/${tourId}/slots`, {
      method: 'POST',
      body: JSON.stringify(slotData),
    });
  },

  deleteTourSlot: async (tourId: string, slotId: string) => {
    return apiRequest(`/admin/tours/${tourId}/slots/${slotId}`, {
      method: 'DELETE',
    });
  },

  getTourParticipants: async (tourId: string) => {
    return apiRequest<any[]>(`/admin/tours/${tourId}/participants`, {
      method: 'GET',
    });
  },
};

export const adminFavoritesApi = {
  getAll: async () => apiRequest('/admin/favorites', { method: 'GET' }),
  create: async (favorite: any) => apiRequest('/admin/favorites', { method: 'POST', body: JSON.stringify(favorite) }),
  update: async (id: string, favorite: any) => apiRequest(`/admin/favorites/${id}`, { method: 'PUT', body: JSON.stringify(favorite) }),
  delete: async (id: string) => apiRequest(`/admin/favorites/${id}`, { method: 'DELETE' }),
};

export const adminToursApi = {
  getAll: async () => adminApi.getAllTours(),
  create: async (tour: any) => adminApi.createTour(tour),
  update: async (id: string, tour: any) => adminApi.updateTour(id, tour),
  delete: async (id: string) => adminApi.deleteTour(id),
};

export const adminRecommendationsApi = {
  getAll: () => apiRequest('/admin/recommendations', { method: 'GET' }),
  create: (data: any) => apiRequest('/admin/recommendations', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiRequest(`/admin/recommendations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiRequest(`/admin/recommendations/${id}`, { method: 'DELETE' }),
};
