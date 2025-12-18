import { useAuthStore } from '@/store/authStore';
import { SplashScreen } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const { isLoading } = useAuthStore();

  if (!isLoading) {
    SplashScreen.hide();
  }

  return null;
}
