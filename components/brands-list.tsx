import { useSearchStore } from '@/store/searchStore';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { Button } from './ui/button';

export interface Brand {
  id: string;
  name: string;
  source: string;
}

export const BRANDS: Brand[] = [
  {
    id: '1',
    name: 'Honda',
    source: require('@/assets/brands/honda.png'),
  },
  {
    id: '2',
    name: 'Yamaha',
    source: require('@/assets/brands/yamaha.png'),
  },
  {
    id: '3',
    name: 'Suzuki',
    source: require('@/assets/brands/suzuki.png'),
  },
  {
    id: '4',
    name: 'Piaggio',
    source: require('@/assets/brands/piaggio.png'),
  },
];

export function BrandsList() {
  const { setBrand, setDefaultSearch } = useSearchStore();

  const handleBrandSelect = (brand: string) => {
    setDefaultSearch();
    setBrand(brand);

    router.push('/(main)/search/results');
  };

  return (
    <View className="-mx-4 -my-8 flex-1">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={208}
        decelerationRate="fast"
        contentContainerClassName="px-4 py-8 gap-4">
        {BRANDS.map((brand) => (
          <Button
            key={brand.id}
            variant="outline"
            className="h-28 w-48 rounded-3xl p-6 shadow shadow-black/5"
            onPress={() => handleBrandSelect(brand.name)}>
            <Image
              source={brand.source}
              style={{ width: '100%', height: '100%' }}
              contentFit="contain"
            />
          </Button>
        ))}
      </ScrollView>
    </View>
  );
}
