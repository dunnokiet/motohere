import { createBooking } from '@/api/booking';
import { RentalDuration, getRentalHours } from '@/components/rental-duration';
import { DatePicker } from '@/components/search/date-picker';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { formatDateTime } from '@/lib/formatters';
import { useAuthStore } from '@/store/authStore';
import { useSearchStore } from '@/store/searchStore';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ConfirmBookingScreen() {
  const { user } = useAuthStore();
  const {
    startTime: storeStartTime,
    endTime: storeEndTime,
    setStartTime: setStoreStartTime,
    setEndTime: setStoreEndTime,
  } = useSearchStore();

  const params = useLocalSearchParams<{
    carId: string;
    pricePerHour: string;
    customerId: string;
    title: string;
  }>();

  const pricePerHour = Number(params.pricePerHour);

  const [rangeStartDate, setRangeStartDate] = useState<Date | null>(
    storeStartTime ? new Date(storeStartTime) : null
  );
  const [rangeEndDate, setRangeEndDate] = useState<Date | null>(
    storeEndTime ? new Date(storeEndTime) : null
  );

  const [startTime, setLocalStartTime] = useState<Date | null>(
    storeStartTime ? new Date(storeStartTime) : null
  );
  const [endTime, setLocalEndTime] = useState<Date | null>(
    storeEndTime ? new Date(storeEndTime) : null
  );

  const now = new Date();
  const minDateTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const minDate = new Date(now);
  minDate.setHours(0, 0, 0, 0);

  const maxDate = new Date(minDate);
  maxDate.setMonth(minDate.getMonth() + 3);

  const totalPrice = useMemo(() => {
    if (!startTime || !endTime) return 0;

    const hours = getRentalHours(startTime, endTime);
    const days = Math.max(1, Math.ceil(hours / 24));

    return days * pricePerHour;
  }, [startTime, endTime, pricePerHour]);

  const handleConfirm = async () => {
    if (!user) return;
    if (!startTime || !endTime) return;

    const isSameDay =
      startTime.getFullYear() === now.getFullYear() &&
      startTime.getMonth() === now.getMonth() &&
      startTime.getDate() === now.getDate();

    if (isSameDay && startTime < minDateTime) {
      Alert.alert('Lỗi', 'Thời gian nhận xe hôm nay phải cách hiện tại ít nhất 2 giờ.');
      return;
    }

    if (endTime <= startTime) {
      Alert.alert('Lỗi', 'Giờ trả xe phải sau giờ nhận xe.');
      return;
    }

    setStoreStartTime(startTime);
    setStoreEndTime(endTime);

    const booking = {
      carId: Number(params.carId),
      customerId: Number(params.customerId),
      startTime: formatDateTime(startTime),
      endTime: formatDateTime(endTime),
      totalPrice,
    };

    try {
      await createBooking(booking, user.accessToken);
      router.push('/(main)/(tabs)/bookings');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
      console.error(error);
    }
  };

  const handleRangeChange = (range: { startDate: Date | null; endDate: Date | null } | null) => {
    if (!range?.startDate || !range?.endDate) {
      setRangeStartDate(null);
      setRangeEndDate(null);
      setLocalStartTime(null);
      setLocalEndTime(null);
      return;
    }

    const newStartDate = new Date(range.startDate);
    newStartDate.setHours(0, 0, 0, 0);
    const newEndDate = new Date(range.endDate);
    newEndDate.setHours(0, 0, 0, 0);

    setRangeStartDate(newStartDate);
    setRangeEndDate(newEndDate);

    const startHour = startTime ? startTime.getHours() : 0;
    const startMinute = startTime ? startTime.getMinutes() : 0;
    const endHour = endTime ? endTime.getHours() : 0;
    const endMinute = endTime ? endTime.getMinutes() : 0;

    const newStart = new Date(newStartDate);
    newStart.setHours(startHour, startMinute, 0, 0);
    const newEnd = new Date(newEndDate);
    newEnd.setHours(endHour, endMinute, 0, 0);

    setLocalStartTime(newStart);
    setLocalEndTime(newEnd);
  };

  const handleStartTimeChange = (time: Date | null | undefined) => {
    if (!time || !rangeStartDate) return;

    const newStart = new Date(rangeStartDate);
    newStart.setHours(time.getHours(), time.getMinutes(), 0, 0);

    const isSameDay =
      newStart.getFullYear() === now.getFullYear() &&
      newStart.getMonth() === now.getMonth() &&
      newStart.getDate() === now.getDate();

    if (isSameDay && newStart < minDateTime) {
      Alert.alert('Lỗi', 'Thời gian nhận xe hôm nay phải cách hiện tại ít nhất 2 giờ.');
      return;
    }

    setLocalStartTime(newStart);

    if (!endTime && rangeEndDate) {
      const newEnd = new Date(rangeEndDate);
      newEnd.setHours(20, 0, 0, 0);
      setLocalEndTime(newEnd);
    }
  };

  const handleEndTimeChange = (time: Date | null | undefined) => {
    if (!time || !rangeEndDate) {
      return;
    }

    const newEnd = new Date(rangeEndDate);
    newEnd.setHours(time.getHours(), time.getMinutes(), 0, 0);

    if (startTime && newEnd <= startTime) {
      Alert.alert('Lỗi', 'Giờ trả xe phải sau giờ nhận xe');
      return;
    }

    setLocalEndTime(newEnd);
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-4 pt-20">
      <View className="flex-1 justify-between gap-8">
        <View className="gap-6">
          <View className="gap-2">
            <Text className="text-xl font-semibold">Xác nhận đặt xe</Text>
            <Text className="text-base text-muted-foreground">
              {params.title || `Xe #${params.carId}`}
            </Text>
          </View>

          <View className="gap-4">
            <Text className="font-medium">Ngày thuê</Text>
            <DatePicker
              mode="range"
              value={
                rangeStartDate && rangeEndDate
                  ? { startDate: rangeStartDate, endDate: rangeEndDate }
                  : undefined
              }
              onChange={handleRangeChange}
              minimumDate={minDate}
              maximumDate={maxDate}
            />

            <View className="flex-row gap-4">
              <View className="flex-1">
                <DatePicker
                  mode="time"
                  placeholder="Giờ nhận xe"
                  value={startTime || undefined}
                  onChange={handleStartTimeChange}
                  disabled={!rangeStartDate}
                />
              </View>
              <View className="flex-1">
                <DatePicker
                  mode="time"
                  placeholder="Giờ trả xe"
                  value={endTime || undefined}
                  onChange={handleEndTimeChange}
                  disabled={!rangeEndDate}
                  // bỏ minimumDate ở đây
                />
              </View>
            </View>

            <RentalDuration startTime={startTime} endTime={endTime} />
          </View>

          <View className="mt-4 gap-2 rounded-3xl bg-secondary p-4">
            <Text className="text-base text-muted-foreground">Tổng giá tạm tính</Text>
            <Text className="text-2xl font-semibold">{totalPrice.toLocaleString('vi-VN')} VND</Text>
            <Text className="text-xs text-muted-foreground">
              Giá dựa trên số ngày thuê và đơn giá {pricePerHour.toLocaleString('vi-VN')} VND/ngày
            </Text>
          </View>
        </View>

        <Button
          className="rounded-full"
          disabled={
            !startTime || !endTime || totalPrice <= 0 || getRentalHours(startTime, endTime) === 0
          }
          onPress={handleConfirm}>
          <Text>Xác nhận đặt xe</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
