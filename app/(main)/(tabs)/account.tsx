import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import { Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconChevronRight } from '@tabler/icons-react-native';
import { Icon } from '@/components/ui/icon';

export default function Account() {
  const { user, signOut } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => {
          signOut();
        },
      },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-4">
        <Text>Bạn cần đăng nhập để xem thông tin tài khoản.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background p-4 pt-20">
      <View className="gap-6">
        <View className="gap-1">
          <Text className="text-sm text-muted-foreground">
            Quản lý thông tin và yêu cầu cho thuê xe của bạn.
          </Text>
        </View>

        <View className="">
          <Button
            className="h-14 justify-between rounded-sm border-0 border-b-2"
            variant="outline"
            onPress={() => router.push('/(main)/account/account-info')}>
            <Text className="text-base">Thông tin tài khoản</Text>
            <Icon as={IconChevronRight} className="size-5 text-muted-foreground" />
          </Button>

          <Button
            className="h-14 justify-between rounded-sm border-0 border-b-2"
            variant="outline"
            onPress={() => router.push('/(main)/account/account-requests')}>
            <Text className="text-base">Yêu cầu cho thuê xe</Text>
            <Icon as={IconChevronRight} className="size-5 text-muted-foreground" />
          </Button>
        </View>

        <View className="mt-8">
          <Button className="rounded-full" variant="destructive" onPress={handleLogout}>
            <Text>Đăng xuất</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
