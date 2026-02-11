import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: number;
  display_name: string;
  email?: string;
  total_points: number;
  level: number;
  family_group_id?: number;
  avatar_url?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      setUser(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load user:', err);
      setError('Failed to load user profile');
      // If token is invalid, clear it
      if (err.response?.status === 401) {
        localStorage.removeItem('auth_token');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, phoneNumber?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.login({ email, phone_number: phoneNumber });
      setUser(response.data.user);
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (displayName: string, email?: string, familyCode?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.register({
        display_name: displayName,
        email,
        family_group_code: familyCode,
      });
      setUser(response.data.user);
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setError(null);
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    reload: loadUser,
  };
}

