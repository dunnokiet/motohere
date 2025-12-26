import {
  cancelBooking,
  confirmBooking,
  getListsBookingsByOwner,
  type Booking,
} from '@/api/bookings';
import { DatePicker } from '@/components/search/date-picker';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { formatDateTime, formatRange, getDefaultTimeRange, parseDateTime } from '@/lib/formatters';
import { useAuthStore } from '@/store/authStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export default function RequestScreen() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

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

  if (!user) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-4">
        <Text>Bạn cần đăng nhập để xem yêu cầu cho thuê xe.</Text>
      </SafeAreaView>
    );
  }

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
    enabled: !!ownerStartTime && !!ownerEndTime,
  });

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
    if (!booking.bookingId) return;

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
    if (!booking.bookingId) return;

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

  const bookings: Booking[] = ownerBookingsData?.bookings || [];
  const filteredBookings = bookings.filter((b) => b.status === statusFilter);

  if (isOwnerBookingsPending) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (ownerBookingsError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-4">
        <View className="items-center gap-4">
          <Text>
            {(ownerBookingsError as any).message ?? 'Có lỗi xảy ra khi tải yêu cầu cho thuê xe.'}
          </Text>
          <Button className="rounded-full" onPress={() => refetchOwnerBookings()}>
            <Text>Thử lại</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background p-4 pt-20">
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
    </SafeAreaView>
  );
}
