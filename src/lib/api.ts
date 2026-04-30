/**
 * API Client for FoodYatra Backend
 * Handles all HTTP requests to the backend API
 */

// Use explicit full URL - ensure backend URL is correct
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Log API base URL for debugging (remove in production)
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL);
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * Get authentication token from localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Set authentication token in localStorage
 */
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

/**
 * Remove authentication token from localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

/**
 * Make an authenticated API request
 */
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getToken();

  // Build full URL
  const fullUrl = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Body should already be stringified by the caller
  // Only stringify if it's an object and not already a string
  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob)) {
    body = JSON.stringify(body);
  }

  try {
    if (import.meta.env.DEV) {
      console.log('API Request:', {
        url: fullUrl,
        method: options.method || 'GET',
        headers,
        body: body && typeof body === 'string' ? JSON.parse(body) : body,
      });
    }

    const response = await fetch(fullUrl, {
      method: options.method || 'GET',
      headers,
      body: body || options.body,
      ...(options.signal && { signal: options.signal }), // Preserve signal if present
      ...(options.credentials && { credentials: options.credentials }), // Preserve credentials if present
    });

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    // Parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      return {
        success: false,
        error: 'Invalid JSON response from server',
      };
    }

    // Return the response data, ensuring success is set correctly
    // Backend already returns success: true/false, so we use that
    return {
      ...data,
      success: data.success !== false, // Ensure success is boolean
    };
  } catch (error) {
    // Handle network errors (CORS, connection refused, etc.)
    const errorMessage = error instanceof Error ? error.message : 'Network error occurred';

    if (import.meta.env.DEV) {
      console.error('API Request Failed:', {
        url: fullUrl,
        error: errorMessage,
        errorObj: error,
      });
    }

    return {
      success: false,
      error: errorMessage.includes('Failed to fetch')
        ? 'Connection Error: Is the backend server running?'
        : errorMessage,
    };
  }
};

/**
 * Check if the backend is reachable
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    // Try to hit the root or a known endpoint. 
    // Since API_BASE_URL usually ends in /api, we can try to fetch a simple list or just the root if we strip /api
    // Let's just try to fetch famous places as a "ping" since it's a public GET
    const response = await fetch(`${API_BASE_URL}/famous-places`, { method: 'GET' });
    return response.ok;
  } catch (error) {
    console.error("Backend Health Check Failed:", error);
    return false;
  }
};

/**
 * Auth API functions
 */
export const authApi = {
  /**
   * Register a new user
   */
  register: async (name: string, email: string, password: string) => {
    const response = await apiRequest<{
      user: { id: string; name: string; email: string };
      token?: string;
    }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }
    );

    // Store token if registration returns one (some backends auto-login on register)
    if (response.success && response.token) {
      setToken(response.token);
    }

    return response;
  },

  /**
   * Login user
   */
  login: async (email: string, password: string) => {
    const response = await apiRequest<{
      token: string;
      user: { id: string; name: string; email: string };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store token if login successful
    if (response.success && response.token) {
      setToken(response.token);
    }

    return response;
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async () => {
    const response = await apiRequest<{
      user: { id: string; name: string; email: string; preferences?: any };
    }>('/auth/me', {
      method: 'GET',
    });

    return response;
  },

  /**
   * Logout user (removes token)
   */
  logout: () => {
    removeToken();
  },
};

/**
 * Recommendations API functions
 */
export const recommendationsApi = {
  /**
   * Get food recommendations (Personalized)
   */
  getMyRecommendations: async () => {
    return apiRequest('/recommendations', { method: 'GET' });
  },

  /**
   * Get generic recommendations (if needed, or map to same)
   */
  getRecommendations: async (params?: any) => {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/recommendations${queryParams ? `?${queryParams}` : ''}`;
    return apiRequest(endpoint, { method: 'GET' });
  },
};

/**
 * User Preferences API functions
 */
export const preferencesApi = {
  /**
   * Get user preferences
   */
  getPreferences: async () => {
    return apiRequest('/preferences', { method: 'GET' });
  },

  /**
   * Update user preferences
   */
  updatePreferences: async (preferences: any) => {
    return apiRequest('/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },
};

/**
 * Admin API functions
 */
export const adminApi = {
  /**
   * Get all food places
   */
  getAllFoodPlaces: async () => {
    return apiRequest('/admin/food-places', { method: 'GET' });
  },

  /**
   * Get food place by ID
   */
  getFoodPlaceById: async (id: string) => {
    return apiRequest(`/admin/food-places/${id}`, { method: 'GET' });
  },

  /**
   * Create food place
   */
  createFoodPlace: async (foodPlace: any) => {
    return apiRequest('/admin/food-places', {
      method: 'POST',
      body: JSON.stringify(foodPlace),
    });
  },

  /**
   * Update food place
   */
  updateFoodPlace: async (id: string, foodPlace: any) => {
    return apiRequest(`/admin/food-places/${id}`, {
      method: 'PUT',
      body: JSON.stringify(foodPlace),
    });
  },

  /**
   * Delete food place
   */
  deleteFoodPlace: async (id: string) => {
    return apiRequest(`/admin/food-places/${id}`, { method: 'DELETE' });
  },

  /**
   * Get all locations
   */
  getAllLocations: async () => {
    return apiRequest('/admin/locations', { method: 'GET' });
  },

  /**
   * Get food places by location
   */
  getFoodPlacesByLocation: async (city: string) => {
    return apiRequest(`/admin/locations/${city}/food-places`, { method: 'GET' });
  },

  /**
   * Get all users
   */
  getAllUsers: async () => {
    return apiRequest('/admin/users', { method: 'GET' });
  },

  /**
   * Get user statistics
   */
  getUserStats: async () => {
    return apiRequest('/admin/users/stats', { method: 'GET' });
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string) => {
    return apiRequest(`/admin/users/${id}`, { method: 'GET' });
  },

  /**
   * Update user
   */
  updateUser: async (id: string, userData: any) => {
    return apiRequest(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Delete user
   */
  deleteUser: async (id: string) => {
    return apiRequest(`/admin/users/${id}`, { method: 'DELETE' });
  },

  getAllFavorites: async () => {
    return apiRequest('/admin/favorites', { method: 'GET' });
  },
  createFavorite: async (favorite: any) => {
    return apiRequest('/admin/favorites', { method: 'POST', body: JSON.stringify(favorite) });
  },
  updateFavorite: async (id: string, favorite: any) => {
    return apiRequest(`/admin/favorites/${id}`, { method: 'PUT', body: JSON.stringify(favorite) });
  },
  deleteFavorite: async (id: string) => {
    return apiRequest(`/admin/favorites/${id}`, { method: 'DELETE' });
  },

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
};

export const adminFavoritesApi = {
  getAll: async () => adminApi.getAllFavorites(),
  create: async (favorite: any) => adminApi.createFavorite(favorite),
  update: async (id: string, favorite: any) => adminApi.updateFavorite(id, favorite),
  delete: async (id: string) => adminApi.deleteFavorite(id),
};

export const adminToursApi = {
  getAll: async () => adminApi.getAllTours(),
  create: async (tour: any) => adminApi.createTour(tour),
  update: async (id: string, tour: any) => adminApi.updateTour(id, tour),
  delete: async (id: string) => adminApi.deleteTour(id),
};
/**
 * Food Places API functions (public)
 */
export const foodPlacesApi = {
  /**
   * Get all food places
   */
  getAllFoodPlaces: async (params?: { city?: string; foodType?: string; isVeg?: string; maxPrice?: number; dish?: string; type?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.city) queryParams.append('city', params.city);
    if (params?.foodType) queryParams.append('foodType', params.foodType);
    if (params?.isVeg) queryParams.append('isVeg', params.isVeg);
    if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params?.dish) queryParams.append('dish', params.dish);
    if (params?.type) queryParams.append('type', params.type);
    const query = queryParams.toString();
    return apiRequest(`/food-places${query ? `?${query}` : ''}`, { method: 'GET' });
  },

  /**
   * Get food place by ID
   */
  getFoodPlaceById: async (id: string) => {
    return apiRequest(`/food-places/${id}`, { method: 'GET' });
  },
};

export const toursApi = {
  getAllTours: async (params?: { city?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.city) queryParams.append('city', params.city);
    const query = queryParams.toString();
    return apiRequest(`/tours${query ? `?${query}` : ''}`, { method: 'GET' });
  },
  getTourById: async (id: string) => {
    return apiRequest(`/tours/${id}`, { method: 'GET' });
  },
};

export const paymentsApi = {
  createSession: async (tourId: string) => {
    return apiRequest<{
      success: boolean;
      message: string;
      amountPaid?: number;
      data?: {
        bookingId: string;
        ticketUrl: string;
      }
    }>('/payments/create-session', {
      method: 'POST',
      body: JSON.stringify({ tourId }),
    });
  },
};
/**
 * Community Posts API functions
 */
export const postsApi = {
  /**
   * Get all posts
   */
  getAllPosts: async () => {
    return apiRequest('/posts', { method: 'GET' });
  },

  /**
   * Create a new post
   */
  createPost: async (postData: { content: string; image?: string; hashtags?: string[] }) => {
    return apiRequest('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  /**
   * Like/Unlike a post
   */
  toggleLike: async (postId: string) => {
    return apiRequest(`/posts/${postId}/like`, { method: 'POST' });
  },

  /**
   * Add a comment to a post
   */
  addComment: async (postId: string, content: string) => {
    return apiRequest(`/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  /**
   * Share a post
   */
  sharePost: async (postId: string) => {
    return apiRequest(`/posts/${postId}/share`, { method: 'POST' });
  },

  /**
   * Delete a post
   */
  deletePost: async (postId: string) => {
    return apiRequest(`/posts/${postId}`, { method: 'DELETE' });
  },
};

export const favoritesApi = {
  getAll: () => apiRequest('/favorites', { method: 'GET' }),
};

// Duplicate recommendationsApi removed from here

export const adminRecommendationsApi = {
  getAll: () => apiRequest('/admin/recommendations', { method: 'GET' }),
  create: (data: any) => apiRequest('/admin/recommendations', { method: 'POST', body: data }),
  update: (id: string, data: any) => apiRequest(`/admin/recommendations/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => apiRequest(`/admin/recommendations/${id}`, { method: 'DELETE' }),
};

export const famousPlaceApi = {
  getAll: () => apiRequest('/famous-places', { method: 'GET' }),

  create: (data: any) => apiRequest('/famous-places', {
    method: 'POST',
    body: data
  }),

  update: (id: string, data: any) => apiRequest(`/famous-places/${id}`, {
    method: 'PUT',
    body: data
  }),

  delete: (id: string) => apiRequest(`/famous-places/${id}`, {
    method: 'DELETE'
  })
};

export const aiApi = {
  getRecommendations: async (data: { city: string; mood: string; budget?: string; foodType?: string }) => {
    return apiRequest<{
      city: string;
      mood: string;
      recommendations: any[];
      explanation: string;
    }>('/ai/recommend', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
