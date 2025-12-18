import { cancelBooking, getListsBookings, type Booking } from '@/api/bookings';
import { DatePicker } from '@/components/search/date-picker';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { formatDateTime, formatRange, getDefaultTimeRange, parseDateTime } from '@/lib/formatters';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, View, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

type BookingStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export default function BookingsScreen() {
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState<BookingStatus>('PENDING');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const defaultRange = getDefaultTimeRange();
  const [startTime, setStartTime] = useState<Date | null>(parseDateTime(defaultRange.startTime));
  const [endTime, setEndTime] = useState<Date | null>(parseDateTime(defaultRange.endTime));

  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['bookings', startTime?.toISOString(), endTime?.toISOString()],
    queryFn: () =>
      getListsBookings(
        {
          startTime: formatDateTime(startTime!),
          endTime: formatDateTime(endTime!),
        },
        user!.accessToken
      ),
    enabled: !!user && !!startTime && !!endTime,
  });

  const bookings = (data?.bookings || []).filter((b) => b.status === statusFilter);

  const handleCancel = (booking: Booking) => {
    if (!booking.bookingId || !user) return;

    const bookingId = booking.bookingId;

    Alert.alert('Hủy yêu cầu', 'Bạn có chắc chắn muốn hủy yêu cầu đặt xe này?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Hủy yêu cầu',
        style: 'destructive',
        onPress: async () => {
          try {
            setCancellingId(bookingId);
            await cancelBooking(Number(bookingId), user.accessToken);
            Alert.alert('Thành công', 'Đã hủy yêu cầu đặt xe.');
            refetch();
          } catch (e: any) {
            Alert.alert('Lỗi', e?.message ?? 'Không thể hủy yêu cầu, vui lòng thử lại.');
          } finally {
            setCancellingId(null);
          }
        },
      },
    ]);
  };

  const renderStatusLabel = (status?: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'COMPLETED':
        return 'Đã xác nhận';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status || '';
    }
  };

  const handlePressBooking = (booking: Booking) => {
    if (!booking.bookingId) return;

    router.push({
      pathname: '/(main)/bookings/[id]',
      params: { id: String(booking.bookingId) },
    });
  };

  const renderItem = ({ item }: { item: Booking }) => (
    <Pressable onPress={() => handlePressBooking(item)}>
      <View className="mb-4 overflow-hidden rounded-3xl border border-border bg-card shadow-sm shadow-black/5">
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

          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-xs font-medium text-muted-foreground">
              {renderStatusLabel(item.status)}
            </Text>

            {item.status === 'PENDING' && (
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                disabled={cancellingId === item.bookingId}
                onPress={() => handleCancel(item)}>
                <Text>{cancellingId === item.bookingId ? 'Đang hủy...' : 'Hủy yêu cầu'}</Text>
              </Button>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );

  if (!user) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-4">
        <Text>Bạn cần đăng nhập để xem đơn thuê.</Text>
      </SafeAreaView>
    );
  }

  if (isPending) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-4">
        <Text>{(error as any).message ?? 'Có lỗi xảy ra'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background px-4 pt-20">
      <View className="mb-4 gap-4">
        <DatePicker
          mode="range"
          value={startTime && endTime ? { startDate: startTime, endDate: endTime } : undefined}
          onChange={(range) => {
            setStartTime(range?.startDate || null);
            setEndTime(range?.endDate || null);
          }}
        />

        <View className="flex-row gap-4">
          <View className="flex-1">
            <DatePicker
              mode="time"
              placeholder="Giờ bắt đầu"
              value={startTime || undefined}
              onChange={setStartTime}
              disabled={!startTime}
            />
          </View>
          <View className="flex-1">
            <DatePicker
              mode="time"
              placeholder="Giờ kết thúc"
              value={endTime || undefined}
              onChange={setEndTime}
              disabled={!endTime}
            />
          </View>
        </View>
      </View>

      <View className="mb-4 flex-row gap-2">
        {(['PENDING', 'COMPLETED', 'CANCELLED'] as BookingStatus[]).map((status) => (
          <Button
            key={status}
            className="flex-1 rounded-full"
            variant={statusFilter === status ? 'default' : 'outline'}
            onPress={() => setStatusFilter(status)}>
            <Text className="text-xs">
              {status === 'PENDING'
                ? 'Chờ xác nhận'
                : status === 'COMPLETED'
                  ? 'Đã xác nhận'
                  : 'Đã hủy'}
            </Text>
          </Button>
        ))}
      </View>

      {bookings.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-center text-muted-foreground">
            Không có đơn thuê nào ở trạng thái này.
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => String(item.bookingId)}
          renderItem={renderItem}
          contentContainerClassName="pb-24"
        />
      )}
    </SafeAreaView>
  );
}
