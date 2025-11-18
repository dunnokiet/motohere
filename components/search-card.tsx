import { formatRange } from '@/lib/formatters';
import { useSearchStore } from '@/store/searchStore';
import { IconCalendarWeek, IconMapPin } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

export function SearchCard() {
  const { location, startTime, endTime, setStartTime, setDefaultSearch } = useSearchStore();

  const handleLocationPress = () => {
    router.push('/(main)/search/location');
  };

  const handleDateTimePress = () => {
    const roundHours = (date: Date) => {
      const temp = new Date(date.getTime());
      let hours = temp.getHours();
      const minutes = temp.getMinutes();

      if (minutes > 0) {
        hours += 1;
        if (hours >= 24) {
          temp.setDate(temp.getDate() + 1);
          hours = 0;
        }
      }

      temp.setHours(hours, 0, 0, 0);
      return temp;
    };

    if (startTime && endTime) {
      setStartTime(roundHours(startTime));
    }

    router.push('/(main)/search/date-time');
  };

  const handleSearchPress = () => {
    setDefaultSearch();

    router.push('/(main)/search/results');
  };
  return (
    <Card className="-mt-20 rounded-3xl shadow-sm shadow-black/5">
      <CardContent>
        <View className="gap-4">
          <Pressable onPress={handleLocationPress}>
            <View className="flex-row gap-2">
              <Icon as={IconMapPin} className="size-5 text-sky-700" />
              <View className="gap-2">
                <Text className="text-muted-foreground">Địa điểm</Text>
                <Text className="font-medium text-foreground">
                  {location?.province || 'Chọn địa điểm'}
                </Text>
              </View>
            </View>
          </Pressable>
          <Pressable onPress={handleDateTimePress}>
            <View className="flex-row gap-2">
              <Icon as={IconCalendarWeek} className="size-5 text-sky-700" />
              <View className="gap-2">
                <Text className="text-muted-foreground">Thời gian thuê</Text>
                <Text className="font-medium text-foreground">
                  {formatRange(startTime, endTime) || 'Chọn thời gian'}
                </Text>
              </View>
            </View>
          </Pressable>
        </View>
      </CardContent>
      <CardFooter>
        <Button className="w-full rounded-full" onPress={handleSearchPress}>
          <Text>Tìm xe</Text>
        </Button>
      </CardFooter>
    </Card>
  );
}
