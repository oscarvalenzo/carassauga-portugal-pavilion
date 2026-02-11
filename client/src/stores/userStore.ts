import { create } from 'zustand';

interface User {
  id: number;
  display_name: string;
  email?: string;
  total_points: number;
  level: number;
  family_group_id?: number;
  avatar_url?: string;
}

interface Badge {
  id: number;
  name: string;
  description: string;
  emoji: string;
  earned: boolean;
  earned_at?: string;
}

interface UserState {
  user: User | null;
  token: string | null;
  badges: Badge[];
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setBadges: (badges: Badge[]) => void;
  updatePoints: (points: number) => void;
  logout: () => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: null,
  badges: [],
  isAuthenticated: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setToken: (token) =>
    set({
      token,
    }),

  setBadges: (badges) =>
    set({
      badges,
    }),

  updatePoints: (points) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            total_points: state.user.total_points + points,
          }
        : null,
    })),

  logout: () =>
    set({
      user: null,
      token: null,
      badges: [],
      isAuthenticated: false,
    }),

  clearUser: () =>
    set({
      user: null,
      token: null,
      badges: [],
      isAuthenticated: false,
    }),
}));

