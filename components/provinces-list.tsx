import { useSearchStore } from '@/store/searchStore';
import { ImageBackground } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from './ui/text';

export interface Province {
  id: string;
  name: string;
  source: string;
  latitude: number;
  longitude: number;
}

export const PROVINCES: Province[] = [
  {
    id: '1',
    name: 'Hồ Chí Minh',
    source: 'https://i.pinimg.com/1200x/5e/5b/d8/5e5bd8c29b7c7580d05fdeb5c605230b.jpg',
    latitude: 10.8231,
    longitude: 106.6297,
  },
  {
    id: '2',
    name: 'Hà Nội',
    source: 'https://i.pinimg.com/736x/20/f5/30/20f530a567ffe680e933c12f3727335a.jpg',
    latitude: 21.0285,
    longitude: 105.8542,
  },
  {
    id: '3',
    name: 'Đà Nẵng',
    source: 'https://i.pinimg.com/1200x/9f/4d/5c/9f4d5ca62d4b63158f3d5d2c6432c00a.jpg',
    latitude: 16.0544,
    longitude: 108.2022,
  },
];

export function ProvincesList() {
  const { setLocation, setDefaultSearch } = useSearchStore();

  const handleProvinceSelect = (province: Province) => {
    setDefaultSearch();

    setLocation({
      id: province.id,
      province: province.name,
      latitude: province.latitude,
      longitude: province.longitude,
    });

    router.push('/(main)/search/results');
  };

  return (
    <View className="-mx-4 -my-8 flex-1">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={256}
        decelerationRate="fast"
        contentContainerClassName="px-4 py-8 gap-4">
        {PROVINCES.map((province) => (
          <Pressable
            onPress={() => handleProvinceSelect(province)}
            key={province.id}
            className="rounded-3xl border border-border bg-background shadow-sm shadow-black/5">
            <View className="h-60 w-60 overflow-hidden rounded-3xl">
              <ImageBackground
                source={province.source}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover">
                <View className="flex-1 items-start justify-end">
                  <View className="m-4 rounded-full bg-secondary px-3 py-1">
                    <Text className="text-sm font-medium text-primary">{province.name}</Text>
                  </View>
                </View>
              </ImageBackground>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
