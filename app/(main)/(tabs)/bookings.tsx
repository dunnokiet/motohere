import { cancelBooking, getDetailBookings, getListsBookings, type Booking } from '@/api/bookings';
import { createReview } from '@/api/review';
import { DatePicker } from '@/components/search/date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { formatDateTime, formatRange, getDefaultTimeRange, parseDateTime } from '@/lib/formatters';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export default function BookingsScreen() {
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState<BookingStatus>('PENDING');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewedBookingIds, setReviewedBookingIds] = useState<number[]>([]);

  const defaultRange = getDefaultTimeRange();
  const [startTime, setStartTime] = useState<Date | null>(parseDateTime(defaultRange.startTime));
  const [endTime, setEndTime] = useState<Date | null>(parseDateTime(defaultRange.endTime));

  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['bookings', user?.userId, startTime?.toISOString(), endTime?.toISOString()],
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

  useEffect(() => {
    if (!user || !data?.bookings) {
      setReviewedBookingIds([]);
      return;
    }

    let cancelled = false;

    const fetchReviewed = async () => {
      const ids: number[] = [];

      await Promise.all(
        data.bookings.map(async (b) => {
          if (!b.bookingId) return;
          try {
            const { bookingDetail } = await getDetailBookings(
              String(b.bookingId),
              user.accessToken
            );

            const reviewsArray = Array.isArray(bookingDetail.review)
              ? bookingDetail.review
              : bookingDetail.review
                ? [bookingDetail.review as any]
                : [];

            const hasReview = reviewsArray.some((r: any) => {
              const rating = typeof r.rating === 'number' ? r.rating : Number(r.rating ?? 0);
              const comment = (r.comment ?? r.reviewText ?? '').trim();
              return rating > 0 && comment.length > 0;
            });

            if (hasReview) {
              ids.push(Number(b.bookingId));
            }
          } catch {}
        })
      );

      if (!cancelled) {
        setReviewedBookingIds(ids);
      }
    };

    fetchReviewed();

    return () => {
      cancelled = true;
    };
  }, [user, data?.bookings]);

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

  const openReviewForm = (booking: Booking) => {
    setReviewBooking(booking);
    setRating(5);
    setReviewText('');
  };

  const handleSubmitReview = async () => {
    if (!user || !reviewBooking) return;
    if (!rating || !reviewText.trim()) {
      Alert.alert('Lỗi', 'Vui lòng chọn số sao và nhập nội dung đánh giá.');
      return;
    }

    try {
      setIsSubmittingReview(true);
      await createReview(
        {
          bookingId: Number(reviewBooking.bookingId),
          rating,
          reviewText: reviewText.trim(),
        },
        user.accessToken
      );
      Alert.alert('Thành công', 'Cảm ơn bạn đã đánh giá.');

      if (reviewBooking.bookingId) {
        setReviewedBookingIds((prev) => [...prev, Number(reviewBooking.bookingId)]);
      }

      setReviewBooking(null);
      setRating(5);
      setReviewText('');
      refetch();
    } catch (e: any) {
      const message = e?.message?.includes('More than one row with the given identifier')
        ? 'Đơn thuê này đã được đánh giá rồi.'
        : (e?.message ?? 'Không thể gửi đánh giá, vui lòng thử lại.');
      Alert.alert('Lỗi', message);
    } finally {
      setIsSubmittingReview(false);
    }
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

  const handlePressBooking = (booking: Booking) => {
    if (!booking.bookingId) return;

    router.push({
      pathname: '/(main)/bookings/[id]',
      params: { id: String(booking.bookingId) },
    });
  };

  const renderItem = ({ item }: { item: Booking }) => {
    const isReviewed = item.bookingId && reviewedBookingIds.includes(Number(item.bookingId));

    return (
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

              {item.status === 'CONFIRMED' && !isReviewed && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onPress={() => openReviewForm(item)}>
                  <Text>Đánh giá</Text>
                </Button>
              )}

              {item.status === 'CONFIRMED' && isReviewed && (
                <Text className="text-xs text-muted-foreground">Đã đánh giá</Text>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

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
        />
      )}

      <Modal
        visible={!!reviewBooking}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewBooking(null)}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View className="flex-1 items-center justify-center bg-black/50">
            <View className="w-11/12 rounded-3xl bg-background p-4">
              <Text className="mb-2 text-lg font-semibold">Đánh giá chuyến đi</Text>
              <Text className="mb-4 text-sm text-muted-foreground">
                {reviewBooking?.car?.brand} {reviewBooking?.car?.model}
              </Text>

              <View className="mb-4 gap-2">
                <Text className="text-sm font-medium">Chọn số sao</Text>
                <View className="flex-row gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable key={star} className="px-2" onPress={() => setRating(star)}>
                      <Text
                        className={
                          star <= rating
                            ? 'text-2xl text-yellow-400'
                            : 'text-2xl text-muted-foreground'
                        }>
                        ★
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View className="mb-4 gap-2">
                <Text className="text-sm font-medium">Nhận xét</Text>
                <Input
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="h-28 rounded-2xl"
                  placeholder="Hãy chia sẻ trải nghiệm của bạn..."
                  value={reviewText}
                  onChangeText={setReviewText}
                />
              </View>

              <View className="flex-row gap-2">
                <Button
                  className="flex-1 rounded-full"
                  variant="outline"
                  disabled={isSubmittingReview}
                  onPress={() => setReviewBooking(null)}>
                  <Text>Hủy</Text>
                </Button>
                <Button
                  className="flex-1 rounded-full"
                  disabled={isSubmittingReview}
                  onPress={handleSubmitReview}>
                  <Text>{isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}</Text>
                </Button>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
