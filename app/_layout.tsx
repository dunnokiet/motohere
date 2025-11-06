import { useAuthStore } from '@/store/authStore';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import '@/global.css';
import '@/polyfills';

export default function RootLayout() {
  return (
    <GestureHandlerRootView className="flex-1">
      <StatusBar />
      <Routes />
      <PortalHost />
    </GestureHandlerRootView>
  );
}

export const unstable_settings = {
  initialRouteName: '(main)',
};

export function Routes() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Stack>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(main)" />
      </Stack.Protected>
    </Stack>
  );
}
