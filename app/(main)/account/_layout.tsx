import { Icon } from '@/components/ui/icon';
import { IconChevronLeft } from '@tabler/icons-react-native';
import { Link, Stack } from 'expo-router';
import { Pressable, View } from 'react-native';

export default function AccountLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
      }}>
      <Stack.Screen
        name="account-info"
        options={{
          title: 'Thông tin tài khoản',
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="account-requests"
        options={{
          title: 'Yêu cầu cho thuê xe',
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
        <View className="flex-row items-center gap-2">
          <Icon as={IconChevronLeft} className="size-5 text-foreground" />
        </View>
      </Pressable>
    </Link>
  );
};
