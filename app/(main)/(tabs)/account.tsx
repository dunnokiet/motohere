import { getInformationAccount, updateInformationAccount, type Account } from '@/api/account';
import { changePassword } from '@/api/auth';
import {
  cancelBooking,
  confirmBooking,
  getListsBookingsByOwner,
  type Booking,
} from '@/api/bookings';
import { DatePicker } from '@/components/search/date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { formatDateTime, formatRange, getDefaultTimeRange, parseDateTime } from '@/lib/formatters';
import { useAuthStore } from '@/store/authStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AccountTab = 'info' | 'request';
type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export default function Account() {
  const [activeTab, setActiveTab] = useState<AccountTab>('info');
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const defaultRange = getDefaultTimeRange();
  const [ownerStartTime, setOwnerStartTime] = useState<Date | null>(
    parseDateTime(defaultRange.startTime)
  );
  const [ownerEndTime, setOwnerEndTime] = useState<Date | null>(
    parseDateTime(defaultRange.endTime)
  );

  const [statusFilter, setStatusFilter] = useState<BookingStatus>('PENDING');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<'confirm' | 'cancel' | null>(null);

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

  const {
    data: ownerBookingsData,
    isPending: isOwnerBookingsPending,
    error: ownerBookingsError,
    refetch: refetchOwnerBookings,
  } = useQuery({
    queryKey: ['ownerBookings', ownerStartTime?.toISOString(), ownerEndTime?.toISOString()],
    queryFn: () =>
      getListsBookingsByOwner(
        {
          startTime: formatDateTime(ownerStartTime!),
          endTime: formatDateTime(ownerEndTime!),
        },
        user.accessToken
      ),
    enabled: activeTab === 'request' && !!user && !!ownerStartTime && !!ownerEndTime,
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

  const handleChangePassword = async () => {
    if (!user || !account) return;

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

  const renderStatusLabel = (status?: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status || '';
    }
  };

  const handleConfirm = (booking: Booking) => {
    if (!booking.bookingId || !user) return;

    const bookingId = String(booking.bookingId);

    Alert.alert('Duyệt yêu cầu', 'Bạn có chắc chắn muốn duyệt yêu cầu đặt xe này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Duyệt',
        style: 'default',
        onPress: async () => {
          try {
            setProcessingId(bookingId);
            setProcessingAction('confirm');
            await confirmBooking(Number(bookingId), user.accessToken);

            await queryClient.invalidateQueries({ queryKey: ['bookings'] });
            await queryClient.invalidateQueries({ queryKey: ['bookingDetail'] });

            Alert.alert('Thành công', 'Đã duyệt yêu cầu đặt xe.');
            refetchOwnerBookings();
          } catch (e: any) {
            Alert.alert('Lỗi', e?.message ?? 'Không thể duyệt yêu cầu, vui lòng thử lại.');
          } finally {
            setProcessingId(null);
            setProcessingAction(null);
          }
        },
      },
    ]);
  };

  const handleCancel = (booking: Booking) => {
    if (!booking.bookingId || !user) return;

    const bookingId = String(booking.bookingId);

    Alert.alert('Hủy yêu cầu', 'Bạn có chắc chắn muốn hủy yêu cầu đặt xe này?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Hủy yêu cầu',
        style: 'destructive',
        onPress: async () => {
          try {
            setProcessingId(bookingId);
            setProcessingAction('cancel');
            await cancelBooking(Number(bookingId), user.accessToken);

            await queryClient.invalidateQueries({ queryKey: ['bookings'] });
            await queryClient.invalidateQueries({ queryKey: ['bookingDetail'] });

            Alert.alert('Thành công', 'Đã hủy yêu cầu đặt xe.');
            refetchOwnerBookings();
          } catch (e: any) {
            Alert.alert('Lỗi', e?.message ?? 'Không thể hủy yêu cầu, vui lòng thử lại.');
          } finally {
            setProcessingId(null);
            setProcessingAction(null);
          }
        },
      },
    ]);
  };

  const renderRequestTab = () => {
    const bookings: Booking[] = ownerBookingsData?.bookings || [];
    const filteredBookings = bookings.filter((b) => b.status === statusFilter);

    if (isOwnerBookingsPending) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      );
    }

    if (ownerBookingsError) {
      return (
        <View className="flex-1 items-center justify-center gap-4">
          <Text>
            {(ownerBookingsError as any).message ?? 'Có lỗi xảy ra khi tải yêu cầu cho thuê xe.'}
          </Text>
          <Button className="rounded-full" onPress={() => refetchOwnerBookings()}>
            <Text>Thử lại</Text>
          </Button>
        </View>
      );
    }

    return (
      <View className="flex-1">
        <View className="mb-4 gap-4">
          <DatePicker
            mode="range"
            value={
              ownerStartTime && ownerEndTime
                ? { startDate: ownerStartTime, endDate: ownerEndTime }
                : undefined
            }
            onChange={(range) => {
              setOwnerStartTime(range?.startDate || null);
              setOwnerEndTime(range?.endDate || null);
            }}
          />

          <View className="flex-row gap-4">
            <View className="flex-1">
              <DatePicker
                mode="time"
                placeholder="Giờ bắt đầu"
                value={ownerStartTime || undefined}
                onChange={setOwnerStartTime}
                disabled={!ownerStartTime}
              />
            </View>
            <View className="flex-1">
              <DatePicker
                mode="time"
                placeholder="Giờ kết thúc"
                value={ownerEndTime || undefined}
                onChange={setOwnerEndTime}
                disabled={!ownerEndTime}
              />
            </View>
          </View>
        </View>

        <View className="mb-4 flex-row gap-2">
          {(['PENDING', 'CONFIRMED', 'CANCELLED'] as BookingStatus[]).map((status) => (
            <Button
              key={status}
              className="flex-1 rounded-full"
              variant={statusFilter === status ? 'default' : 'outline'}
              onPress={() => setStatusFilter(status)}>
              <Text className="text-xs">
                {status === 'PENDING'
                  ? 'Chờ xác nhận'
                  : status === 'CONFIRMED'
                    ? 'Đã xác nhận'
                    : 'Đã hủy'}
              </Text>
            </Button>
          ))}
        </View>

        {filteredBookings.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-center text-muted-foreground">
              Không có yêu cầu cho thuê nào trong khoảng thời gian và trạng thái này.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredBookings}
            keyExtractor={(item) => String(item.bookingId)}
            contentContainerClassName="gap-4"
            renderItem={({ item }) => (
              <View className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm shadow-black/5">
                <View className="h-40 w-full overflow-hidden bg-secondary">
                  {item.car?.images?.[0]?.url && (
                    <Image
                      source={{ uri: item.car.images[0].url }}
                      style={{ width: '100%', height: '100%' }}
                    />
                  )}
                </View>

                <View className="gap-2 p-4">
                  <Text className="text-base font-semibold">
                    {item.car?.brand} {item.car?.model}
                  </Text>
                  <Text className="mt-1 text-sm text-muted-foreground">
                    {formatRange(new Date(item.startTime), new Date(item.endTime))}
                  </Text>
                  <Text className="mt-1 text-sm">
                    Tổng giá: {item.totalPrice.toLocaleString('vi-VN')} VND
                  </Text>
                  <Text className="mt-1 text-sm">
                    Khách thuê: {item.customerName} - {item.customerPhone}
                  </Text>

                  <View className="mt-3 flex-row items-center justify-between">
                    <Text className="text-xs font-medium text-muted-foreground">
                      {renderStatusLabel(item.status)}
                    </Text>

                    {item.status === 'PENDING' && (
                      <View className="flex-row gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          disabled={processingId === String(item.bookingId)}
                          onPress={() => handleConfirm(item)}>
                          <Text>
                            {processingId === String(item.bookingId) &&
                            processingAction === 'confirm'
                              ? 'Đang duyệt...'
                              : 'Duyệt'}
                          </Text>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          disabled={processingId === String(item.bookingId)}
                          onPress={() => handleCancel(item)}>
                          <Text>
                            {processingId === String(item.bookingId) &&
                            processingAction === 'cancel'
                              ? 'Đang hủy...'
                              : 'Hủy'}
                          </Text>
                        </Button>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </View>
    );
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

  return (
    <SafeAreaView className="flex-1 bg-background p-4 pt-20">
      {renderChangePasswordModal()}
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
