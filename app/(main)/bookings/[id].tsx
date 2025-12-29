import { getDetailBookings, type BookingDetail } from '@/api/bookings';
import { Carousel, CarouselItem } from '@/components/ui/carousel';
import { Text } from '@/components/ui/text';
import { formatRange } from '@/lib/formatters';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function renderStatusLabel(status?: string) {
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
}

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();

  if (!user) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-4">
        <Text>Bạn cần đăng nhập để xem chi tiết đơn thuê.</Text>
      </SafeAreaView>
    );
  }

  const { data, isPending, error } = useQuery({
    queryKey: ['bookingDetail', id],
    queryFn: () => getDetailBookings(String(id), user.accessToken),
    enabled: !!id,
  });

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

  const booking: BookingDetail | undefined = data?.bookingDetail;
  if (!booking) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-4">
        <Text>Không tìm thấy thông tin đơn thuê.</Text>
      </SafeAreaView>
    );
  }

  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);

  return (
    <SafeAreaView className="flex-1 bg-background p-4 pt-20">
      <ScrollView contentContainerClassName="gap-4" showsVerticalScrollIndicator={false}>
        <View className="mb-12 h-60 rounded-3xl border border-border bg-secondary shadow-sm shadow-black/5">
          {booking.car.images && booking.car.images.length > 0 && (
            <Carousel>
              {booking.car.images.map((image) => (
                <CarouselItem key={image.id}>
                  <Image source={{ uri: image.url }} style={{ width: '100%', height: '100%' }} />
                </CarouselItem>
              ))}
            </Carousel>
          )}
        </View>

        <View className="gap-2">
          <View className="gap-1">
            <Text className="text-xl font-semibold">
              {booking.car.brand} {booking.car.model}
            </Text>
            <Text className="text-sm text-muted-foreground">Năm sản xuất: {booking.car.year}</Text>
          </View>

          <View className="gap-2 rounded-3xl bg-secondary p-4">
            <Text className="text-sm text-muted-foreground">Thời gian thuê</Text>
            <Text className="text-base font-semibold">{formatRange(start, end)}</Text>
          </View>

          <View className="gap-2 rounded-3xl bg-secondary p-4">
            <Text className="text-sm text-muted-foreground">Trạng thái</Text>
            <Text className="text-base font-semibold">{renderStatusLabel(booking.status)}</Text>
          </View>

          <View className="gap-2 rounded-3xl bg-secondary p-4">
            <Text className="text-sm text-muted-foreground">Tổng giá</Text>
            <Text className="text-2xl font-semibold">
              {booking.totalPrice.toLocaleString('vi-VN')} VND
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
