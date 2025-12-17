import { getInformationAccount, updateInformationAccount, type Account } from '@/api/account';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AccountTab = 'info' | 'request';

export default function Account() {
  const [activeTab, setActiveTab] = useState<AccountTab>('info');
  const { user } = useAuthStore();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!user) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-4">
        <Text>Bạn cần đăng nhập để xem thông tin tài khoản.</Text>
      </SafeAreaView>
    );
  }

  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['accountInformation'],
    queryFn: () => getInformationAccount(user.accessToken),
  });

  const account: Account | undefined = data?.accountDetail;

  useEffect(() => {
    if (account) {
      setEmail(account.email);
      setPhone(account.phone);
      setBirthDate(account.birthDate);
    }
  }, [account]);

  const handleUpdate = async () => {
    if (!user) return;

    try {
      setIsUpdating(true);
      await updateInformationAccount(
        {
          email,
          phone,
          birthDate,
        },
        user.accessToken
      );
      Alert.alert('Thành công', 'Cập nhật thông tin tài khoản thành công.');
      refetch();
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message ?? 'Không thể cập nhật thông tin, vui lòng thử lại.');
    } finally {
      setIsUpdating(false);
    }
  };

  const renderInfoTab = () => {
    if (isPending) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 items-center justify-center gap-4">
          <Text>{(error as any).message ?? 'Có lỗi xảy ra khi tải thông tin tài khoản.'}</Text>
          <Button className="rounded-full" onPress={() => refetch()}>
            <Text>Thử lại</Text>
          </Button>
        </View>
      );
    }

    if (!account) {
      return (
        <View className="flex-1 items-center justify-center">
          <Text>Không tìm thấy thông tin tài khoản.</Text>
        </View>
      );
    }

    return (
      <View className="gap-4">
        <View className="gap-2 rounded-3xl border border-border bg-secondary p-4 shadow-sm shadow-black/5">
          <Text className="text-lg font-semibold">Thông tin tài khoản</Text>

          <View className="mt-2 gap-3">
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted-foreground">ID</Text>
              <Text className="text-sm font-medium">{account.id}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted-foreground">Tên đăng nhập</Text>
              <Text className="text-sm font-medium">{account.username}</Text>
            </View>

            <View className="gap-1">
              <Text className="text-sm text-muted-foreground">Email</Text>
              <Input
                className="rounded-full"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View className="gap-1">
              <Text className="text-sm text-muted-foreground">Số điện thoại</Text>
              <Input
                className="rounded-full"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View className="gap-1">
              <Text className="text-sm text-muted-foreground">Ngày sinh (YYYY-MM-DD)</Text>
              <Input
                className="rounded-full"
                value={birthDate}
                onChangeText={setBirthDate}
                placeholder="2004-04-14"
              />
            </View>
          </View>
        </View>

        <Button className="rounded-full" disabled={isUpdating} onPress={handleUpdate}>
          <Text>{isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}</Text>
        </Button>
      </View>
    );
  };

  const renderRequestTab = () => {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Yêu cầu cho thuê xe sẽ được triển khai sau.</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-4 pt-20">
      <View className="mb-4 flex-row gap-2">
        <Button
          className="flex-1 rounded-full"
          variant={activeTab === 'info' ? 'default' : 'outline'}
          onPress={() => setActiveTab('info')}>
          <Text className="text-xs">Thông tin tài khoản</Text>
        </Button>
        <Button
          className="flex-1 rounded-full"
          variant={activeTab === 'request' ? 'default' : 'outline'}
          onPress={() => setActiveTab('request')}>
          <Text className="text-xs">Yêu cầu cho thuê xe</Text>
        </Button>
      </View>

      {activeTab === 'info' ? renderInfoTab() : renderRequestTab()}
    </SafeAreaView>
  );
}
