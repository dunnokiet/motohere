import { DatePicker } from '@/components/search/date-picker';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useSearchStore } from '@/store/searchStore';
import { router } from 'expo-router';
import { View } from 'react-native';
import { RentalDuration } from '../rental-duration';

export function DateTimeForm() {
  const { startTime, endTime, setStartTime, setEndTime } = useSearchStore();

  const handleSubmit = () => {
    router.push('/(main)/search/results');
  };

  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  const maxDate = new Date(minDate);
  maxDate.setMonth(minDate.getMonth() + 3);

  return (
    <View className="flex-1 justify-between">
      <View className="gap-6">
        <View className="gap-4">
          <DatePicker
            mode="range"
            value={startTime && endTime ? { startDate: startTime, endDate: endTime } : undefined}
            onChange={(dateRange) => {
              setStartTime(dateRange?.startDate || null);
              setEndTime(dateRange?.endDate || null);
            }}
            minimumDate={minDate}
            maximumDate={maxDate}
          />
          <View className="flex-row gap-4">
            <View className="flex-1">
              <DatePicker
                mode="time"
                placeholder="Giờ nhận xe"
                value={startTime || undefined}
                onChange={setStartTime}
                disabled={!startTime}
              />
            </View>
            <View className="flex-1">
              <DatePicker
                mode="time"
                placeholder="Giờ trả xe"
                value={endTime || undefined}
                disabled={!endTime}
                onChange={setEndTime}
              />
            </View>
          </View>
        </View>
        <RentalDuration startTime={startTime} endTime={endTime} />
      </View>
      <View className="gap-6">
        <Text className="text-center">Bạn chỉ đặt trước xe thuê trong vòng 90 ngày</Text>
        <Button className="rounded-full" onPress={handleSubmit}>
          <Text>Tìm xe</Text>
        </Button>
      </View>
    </View>
  );
}
