import { Icon } from '@/components/ui/icon';
import { IconChevronLeft } from '@tabler/icons-react-native';
import { Link, Stack } from 'expo-router';
import { Pressable } from 'react-native';

export default function BookingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Chi tiết đơn thuê',
          headerTransparent: true,
          headerLeft: () => <BackButton />,
        }}
      />
    </Stack>
  );
}

const BackButton = () => {
  return (
    <Link href=".." asChild>
      <Pressable className="justify-between px-2">
        <Icon as={IconChevronLeft} className="size-5 text-foreground" />
      </Pressable>
    </Link>
  );
};
