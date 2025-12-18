import { useSearchStore } from '@/store/searchStore';
import { IconMapPin } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { Button } from '../ui/button';
import { Icon } from '../ui/icon';
import { Text } from '../ui/text';

export interface Province {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export const PROVINCES: Province[] = [
  {
    id: '1',
    name: 'Thành phố Hồ Chí Minh',
    latitude: 10.8231,
    longitude: 106.6297,
  },
  {
    id: '2',
    name: 'Thành phố Hà Nội',
    latitude: 21.0285,
    longitude: 105.8542,
  },
  {
    id: '3',
    name: 'Thành phố Đà Nẵng',
    latitude: 16.0544,
    longitude: 108.2022,
  },
  {
    id: '4',
    name: 'Thành phố Khánh Hòa',
    latitude: 12.2388,
    longitude: 109.1967,
  },
  {
    id: '5',
    name: 'Thành phố Cần Thơ',
    latitude: 10.0452,
    longitude: 105.7469,
  },
  {
    id: '6',
    name: ' Thành phố Huế',
    latitude: 16.4637,
    longitude: 107.5905,
  },
];

export function ProvincesList() {
  const { setLocation } = useSearchStore();

  const handleProvinceSelect = (province: Province) => {
    setLocation({
      id: province.id,
      province: province.name,
      latitude: province.latitude,
      longitude: province.longitude,
    });

    router.back();
  };

  return (
    <View className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-4">
        {PROVINCES.map((province) => (
          <Button
            variant="secondary"
            onPress={() => handleProvinceSelect(province)}
            className="justify-start rounded-full border-neutral-700"
            key={province.id}>
            <Icon as={IconMapPin} className="size-4" />
            <Text>{province.name}</Text>
          </Button>
        ))}
      </ScrollView>
    </View>
  );
}
