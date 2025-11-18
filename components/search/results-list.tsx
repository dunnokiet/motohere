import { searchBikes } from '@/api/bikes';
import { formatDateTime, formatPrice } from '@/lib/formatters';
import { useAuthStore } from '@/store/authStore';
import { useSearchStore } from '@/store/searchStore';
import { IconCornerUpRight } from '@tabler/icons-react-native';
import { useQuery } from '@tanstack/react-query';
import { ImageBackground } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { Badge } from '../ui/badge';
import { Icon } from '../ui/icon';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';

export function ResultsList() {
  const { user } = useAuthStore();
  const { location, startTime, endTime, brand } = useSearchStore();

  const { isPending, error, data } = useQuery({
    queryKey: ['searchBikes', location?.province, startTime, endTime, brand],
    queryFn: () =>
      searchBikes(
        {
          startTime: formatDateTime(startTime!),
          endTime: formatDateTime(endTime!),
          brand: brand!,
          province: location?.province,
        },
        user?.accessToken || null
      ),
    enabled: !!startTime && !!endTime,
  });

  const handlePress = (id: string) => {
    router.push(`/(main)/bikes/${id}`);
  };

  if (isPending)
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-4">
        {[...Array(5)].map((_, index) => (
          <Skeleton key={index} className="h-80 w-full rounded-3xl" />
        ))}
      </ScrollView>
    );

  if (error) {
    <View className="h-80 border border-destructive bg-destructive-foreground">
      <Text className="text-destructive">{error.message}</Text>
    </View>;
  }

  return (
    <View className="-mx-4 flex-1">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-4 gap-4">
        {data?.bikes.map((bike) => (
          <Pressable key={bike.id} onPress={() => handlePress(bike.id)}>
            <View className="h-80 w-full rounded-3xl border border-border bg-background shadow-sm shadow-black/5">
              <View className="m-2 mb-0 flex-1 overflow-hidden rounded-2xl bg-secondary">
                {bike.images.length > 0 && (
                  <ImageBackground
                    source={{
                      uri: bike.images[0].url,
                    }}
                    style={{ width: '100%', height: '100%' }}
                    contentPosition="bottom center"
                    contentFit="cover">
                    <View className="m-4 flex-1 items-end justify-end">
                      <Badge variant="secondary" className="rounded-full">
                        <Icon as={IconCornerUpRight} />
                        <Text>{bike.distance}km</Text>
                      </Badge>
                    </View>
                  </ImageBackground>
                )}
              </View>
              <View className="flex-row items-end justify-between p-4">
                <View className="flex-1 gap-0.5">
                  <Text className="font-medium">{`${bike.model}`}</Text>
                  <Text className="text-sm text-muted-foreground">{bike.year}</Text>
                </View>
                <View className="items-end gap-0.5">
                  <Text className="font-medium text-emerald-700">
                    {formatPrice(bike.pricePerHour)}
                  </Text>
                  <Text className="text-sm">/ ngày</Text>
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
