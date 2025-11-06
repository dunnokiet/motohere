import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';

export function useBottomTabOverflow() {
  try {
    return Platform.OS === 'ios' ? useBottomTabBarHeight() : 0;
  } catch {
    return 0;
  }
}
