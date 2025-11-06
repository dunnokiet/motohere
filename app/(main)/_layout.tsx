import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { IconX } from '@tabler/icons-react-native';
import { Link, Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="term"
        options={{
          headerTransparent: true,
          headerShown: true,
          title: 'Điều khoản và điều kiện',
          headerLeft: () => <CloseButton />,
        }}
      />
      <Stack.Screen
        name="company"
        options={{
          headerTransparent: true,
          headerShown: true,
          title: 'Pháp nhân công ty',
          headerLeft: () => <CloseButton />,
        }}
      />
    </Stack>
  );
}

const CloseButton = () => {
  return (
    <Link href=".." asChild>
      <Button size="icon" className="rounded-full" variant="ghost">
        <Icon as={IconX} className="size-5" />
      </Button>
    </Link>
  );
};
