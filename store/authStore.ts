import { create } from 'zustand';

const API_URL = process.env.EXPO_PUBLIC_API_URL!;

export interface User {
  id: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface AuthState {
  user: User | null;

  isAuthenticated: boolean;
  isLoading: boolean;

  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,

  isAuthenticated: false,
  isLoading: false,

  signIn: async (username: string, password: string) => {
    set({ isLoading: true });

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (!response.ok || result.status !== 200) {
        set({ isLoading: false });
        throw new Error(result.message[0]);
      }

      set({
        user: {
          id: result.data.userId,
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.message);
    }
  },

  signUp: async (username: string, password: string) => {
    set({ isLoading: true });

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (!response.ok || result.status !== 200) {
        set({ isLoading: false });
        throw new Error(result.message[0]);
      }

      set({
        user: {
          id: result.data.userId,
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.message);
    }
  },

  signOut: async () => {
    set({ isLoading: true });

    const { user } = get();

    if (!user?.accessToken) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'x-token': user.accessToken,
        },
      });

      const result = await response.json();

      if (!response.ok || result.status !== 200) {
        set({ isLoading: false });
        throw new Error(result.message[0]);
      }

      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.message);
    }
  },
}));
