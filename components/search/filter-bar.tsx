import { useSearchStore } from '@/store/searchStore';
import { ScrollView, View } from 'react-native';
import { Button } from '../ui/button';
import { Text } from '../ui/text';

export interface Brand {
  id: string;
  name: string;
}

export const BRANDS: Brand[] = [
  {
    id: '1',
    name: 'Honda',
  },
  {
    id: '2',
    name: 'Yamaha',
  },
  {
    id: '3',
    name: 'Suzuki',
  },
  {
    id: '4',
    name: 'Piaggio',
  },
];

export function FilterBar() {
  const { brand, setBrand } = useSearchStore();

  const handleSelectBrand = (name: string | null) => {
    setBrand(name ?? null);
  };

  return (
    <View className="-mx-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-4 px-4">
        <Button
          className="rounded-full"
          onPress={() => handleSelectBrand(null)}
          variant={!brand ? 'default' : 'outline'}>
          <Text>Tất cả</Text>
        </Button>
        {BRANDS.map((b) => (
          <Button
            key={b.id}
            onPress={() => handleSelectBrand(b.name)}
            variant={brand === b.name ? 'default' : 'outline'}
            className="rounded-full">
            <Text>{b.name}</Text>
          </Button>
        ))}
      </ScrollView>
    </View>
  );
}
