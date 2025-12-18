import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { IconChevronLeft, IconX } from '@tabler/icons-react-native';
import { Link, Stack } from 'expo-router';
import { Pressable } from 'react-native';

export default function CredentialsLayout() {
  return (
    <Stack
      screenOptions={{
        gestureEnabled: false,
        headerTransparent: true,
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
          headerLeft: () => <BackButton />,
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
        <Icon as={IconX} className="size-5 text-foreground" />
      </Pressable>
    </Link>
  );
};

const BackButton = () => {
  return (
    <Link href=".." asChild>
      <Pressable className="dark flex-row items-center gap-2 px-2">
        <Icon as={IconChevronLeft} className="size-5 text-foreground" />
        <Text>Quay lại</Text>
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
