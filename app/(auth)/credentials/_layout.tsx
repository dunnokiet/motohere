import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { IconX } from '@tabler/icons-react-native';
import { Link, Stack } from 'expo-router';
import { Pressable } from 'react-native';

export default function CredentialsLayout() {
  return (
    <Stack
      screenOptions={{
        gestureEnabled: false,
        headerTransparent: true,
        headerTintColor: THEME.dark.foreground,
      }}>
      <Stack.Screen
        name="sign-in"
        options={{
          headerLeft: () => <CloseButton />,
          headerRight: () => <SignUpButton />,
          title: '',
        }}
      />
      <Stack.Screen
        name="sign-up"
        options={{
          headerBackTitle: 'Quay lại',
          title: '',
        }}
      />
    </Stack>
  );
}
const CloseButton = () => {
  return (
    <Link href=".." asChild>
      <Pressable className="dark justify-center px-2">
        <Icon as={IconX} className="size-6 text-foreground" />
      </Pressable>
    </Link>
  );
};

const SignUpButton = () => {
  return (
    <Link href="/(auth)/credentials/sign-up" asChild>
      <Pressable className="dark justify-center px-3">
        <Text>Đăng ký</Text>
      </Pressable>
    </Link>
  );
};
