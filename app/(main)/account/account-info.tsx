import { getInformationAccount, updateInformationAccount, type Account } from '@/api/account';
import { changePassword } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InfoScreen() {
  const { user } = useAuthStore();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

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

  const hasChanges =
    !!account &&
    (email !== account.email || phone !== account.phone || birthDate !== account.birthDate);

  const handleUpdate = async () => {
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

  const handleChangePassword = async () => {
    if (!account) return;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    try {
      setIsSubmittingPassword(true);
      await changePassword(account.username, oldPassword, newPassword, user.accessToken);
      Alert.alert('Thành công', 'Đổi mật khẩu thành công.');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setIsChangingPassword(false);
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message ?? 'Không thể đổi mật khẩu, vui lòng thử lại.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const renderChangePasswordModal = () => (
    <Modal
      visible={isChangingPassword}
      transparent
      animationType="slide"
      onRequestClose={() => setIsChangingPassword(false)}>
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="w-11/12 rounded-3xl bg-background p-4">
            <Text className="mb-4 text-lg font-semibold">Đổi mật khẩu</Text>

            <View className="mb-3 gap-1">
              <Text className="text-sm text-muted-foreground">Mật khẩu hiện tại</Text>
              <Input
                className="rounded-full"
                secureTextEntry
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder="Nhập mật khẩu hiện tại"
              />
            </View>

            <View className="mb-3 gap-1">
              <Text className="text-sm text-muted-foreground">Mật khẩu mới</Text>
              <Input
                className="rounded-full"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nhập mật khẩu mới"
              />
            </View>

            <View className="mb-4 gap-1">
              <Text className="text-sm text-muted-foreground">Xác nhận mật khẩu mới</Text>
              <Input
                className="rounded-full"
                secureTextEntry
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                placeholder="Nhập lại mật khẩu mới"
              />
            </View>

            <View className="flex-row gap-2">
              <Button
                className="flex-1 rounded-full"
                variant="outline"
                disabled={isSubmittingPassword}
                onPress={() => {
                  setIsChangingPassword(false);
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                }}>
                <Text>Hủy</Text>
              </Button>
              <Button
                className="flex-1 rounded-full"
                disabled={isSubmittingPassword}
                onPress={handleChangePassword}>
                <Text>{isSubmittingPassword ? 'Đang gửi...' : 'Xác nhận'}</Text>
              </Button>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  const renderContent = () => {
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

        <Button
          className="rounded-full"
          disabled={isUpdating || !hasChanges}
          onPress={handleUpdate}>
          <Text>{isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}</Text>
        </Button>

        <View className="mt-4 gap-3">
          <Button
            className="rounded-full"
            variant="outline"
            onPress={() => setIsChangingPassword(true)}>
            <Text>Đổi mật khẩu</Text>
          </Button>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-4 pt-20">
      {renderChangePasswordModal()}
      {renderContent()}
    </SafeAreaView>
  );
}
