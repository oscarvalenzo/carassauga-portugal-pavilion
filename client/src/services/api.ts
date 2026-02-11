import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request Interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    // Try to get token from localStorage (supports both 'token' and 'auth_token' keys)
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear both possible token keys
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      // Optionally dispatch logout event for app-wide handling
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    
    return Promise.reject(error);
  }
);

// ============================================================================
// AUTH API
// ============================================================================

export const authAPI = {
  /**
   * Register a new user
   */
  register: async (data: { 
    display_name: string; 
    email?: string; 
    family_group_code?: string;
    phone_number?: string;
  }) => {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response;
  },

  /**
   * Login existing user
   */
  login: async (data: { email: string; phone_number?: string }) => {
    const response = await api.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response;
  },

  /**
   * Get current user profile
   */
  getProfile: () => api.get('/users/me'),

  /**
   * Refresh auth token
   */
  refreshToken: async () => {
    const response = await api.post('/auth/refresh-token');
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response;
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new CustomEvent('auth:logout'));
    return Promise.resolve();
  },
};

// ============================================================================
// QUEST API
// ============================================================================

export const questAPI = {
  /**
   * Get all available quests
   */
  getAll: () => api.get('/quests'),

  /**
   * Get user's quest progress
   */
  getProgress: () => api.get('/quests/progress'),

  /**
   * Complete an activity (QR code scan)
   */
  completeActivity: (activity_id: number, qr_code: string) =>
    api.post('/quests/complete-activity', { activity_id, qr_code }),

  /**
   * Get specific quest details
   */
  getById: (id: number) => api.get(`/quests/${id}`),
};

// ============================================================================
// ACTIVITY API
// ============================================================================

export const activityAPI = {
  /**
   * Get all activities
   */
  getAll: () => api.get('/activities'),

  /**
   * Get activity by ID
   */
  getById: (id: number) => api.get(`/activities/${id}`),

  /**
   * Get activities by category
   */
  getByCategory: (category: string) => api.get(`/activities?category=${category}`),

  /**
   * Complete an activity by QR code
   */
  complete: (qr_code: string) => api.post('/activities/complete', { qr_code }),
};

// ============================================================================
// BADGE API
// ============================================================================

export const badgeAPI = {
  /**
   * Get all badges
   */
  getAll: () => api.get('/badges'),

  /**
   * Get user's earned badges
   */
  getEarned: () => api.get('/badges/earned'),

  /**
   * Get badge by ID
   */
  getById: (id: number) => api.get(`/badges/${id}`),
};

// ============================================================================
// LEADERBOARD API
// ============================================================================

export const leaderboardAPI = {
  /**
   * Get family leaderboard
   */
  getFamily: (familyId: number) => api.get(`/leaderboard/family/${familyId}`),

  /**
   * Get pavilion leaderboard
   */
  getPavilion: () => api.get('/leaderboard/pavilion'),

  /**
   * Get global leaderboard
   */
  getGlobal: () => api.get('/leaderboard/global'),
};

// ============================================================================
// EVENT API
// ============================================================================

export const eventAPI = {
  /**
   * Get all events
   */
  getAll: () => api.get('/events'),

  /**
   * Get live/happening now events
   */
  getLive: () => api.get('/events/live'),

  /**
   * Get event by ID
   */
  getById: (id: number) => api.get(`/events/${id}`),
};

// ============================================================================
// QUEUE API
// ============================================================================

export const queueAPI = {
  /**
   * Join virtual queue
   */
  join: (station_name: string, phone_number?: string) =>
    api.post('/queue/join', { station_name, phone_number }),

  /**
   * Leave queue
   */
  leave: () => api.delete('/queue/leave'),

  /**
   * Get current queue position
   */
  getPosition: () => api.get('/queue/position'),

  /**
   * Get queue status for a station
   */
  getStationStatus: (station_name: string) => 
    api.get(`/queue/station/${station_name}`),
};

// ============================================================================
// USER API
// ============================================================================

export const userAPI = {
  /**
   * Get user stats
   */
  getStats: (userId: number) => api.get(`/users/${userId}/stats`),

  /**
   * Update user profile
   */
  updateProfile: (data: { display_name?: string; phone_number?: string }) =>
    api.put('/users/me', data),

  /**
   * Join family group
   */
  joinFamilyGroup: (code: string) => 
    api.post('/users/family-group', { code }),

  /**
   * Get family group members
   */
  getFamilyGroup: () => api.get('/users/family-group'),
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if backend is reachable
 */
export const healthCheck = async (): Promise<boolean> => {
  try {
    await api.get('/health');
    return true;
  } catch {
    return false;
  }
};

/**
 * Get API base URL
 */
export const getApiUrl = (): string => API_BASE_URL;

// ============================================================================
// RECIPE API
// ============================================================================

export const recipeAPI = {
  /**
   * Get all available recipes
   */
  getAll: () => api.get('/recipes'),

  /**
   * Get user's saved recipes
   */
  getSaved: () => api.get('/recipes/saved'),

  /**
   * Save a recipe
   */
  save: (recipe_name: string) =>
    api.post('/recipes/save', { recipe_name }),

  /**
   * Unsave a recipe
   */
  unsave: (recipeId: number) => api.delete(`/recipes/unsave/${recipeId}`),
};

// Export axios instance for custom requests
export default api;
