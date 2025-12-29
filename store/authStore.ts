import { create } from 'zustand';
import * as AuthAPI from '../api/auth';
import { User } from '../api/auth';

interface AuthState {
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

  signIn: async (username, password) => {
    set({ isLoading: true });
    try {
      const { user } = await AuthAPI.login(username, password);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.message);
    }
  },

  signUp: async (username, password) => {
    set({ isLoading: true });
    try {
      await AuthAPI.register(username, password);

      set({
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

    if (!user?.refreshToken) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      await AuthAPI.logout(user.refreshToken);
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.message);
    }
  },
}));
