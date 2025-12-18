import { BRANDS } from '@/components/search/filter-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useSearchStore } from '@/store/searchStore';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FiltersScreen() {
  const { brand, minPrice, maxPrice, year, setBrand, setMinPrice, setMaxPrice, setYear } =
    useSearchStore();

  const [localMinPrice, setLocalMinPrice] = useState(minPrice ? String(minPrice) : '');
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice ? String(maxPrice) : '');
  const [localYear, setLocalYear] = useState(year ? String(year) : '');

  const handleApply = () => {
    const parsedMin = localMinPrice ? Number(localMinPrice) : null;
    const parsedMax = localMaxPrice ? Number(localMaxPrice) : null;
    const parsedYear = localYear ? Number(localYear) : null;

    if (
      Number.isNaN(parsedMin as number) ||
      Number.isNaN(parsedMax as number) ||
      Number.isNaN(parsedYear as number)
    ) {
      Alert.alert('Lỗi', 'Vui lòng nhập giá và năm sản xuất hợp lệ.');
      return;
    }

    if (parsedMin !== null && parsedMax !== null && parsedMin > parsedMax) {
      Alert.alert('Lỗi', 'Giá tối thiểu không được lớn hơn giá tối đa.');
      return;
    }

    setMinPrice(parsedMin);
    setMaxPrice(parsedMax);
    setYear(parsedYear);

    router.back();
  };

  const handleClear = () => {
    setBrand(null);
    setMinPrice(null);
    setMaxPrice(null);
    setYear(null);
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setLocalYear('');
  };

  const handleSelectBrand = (name: string | null) => {
    setBrand(name);
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-4 pt-20">
      <ScrollView className="flex-1" contentContainerClassName="gap-6 pb-8">
        <View className="gap-2">
          <Text className="text-base font-semibold">Hãng xe</Text>
          <View className="flex-row flex-wrap gap-2">
            <Button
              className="rounded-full"
              variant={!brand ? 'default' : 'outline'}
              onPress={() => handleSelectBrand(null)}>
              <Text>Tất cả</Text>
            </Button>
            {BRANDS.map((b) => (
              <Button
                key={b.id}
                className="rounded-full"
                variant={brand === b.name ? 'default' : 'outline'}
                onPress={() => handleSelectBrand(b.name)}>
                <Text>{b.name}</Text>
              </Button>
            ))}
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-base font-semibold">Giá thuê / giờ (VNĐ)</Text>
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Input
                className="rounded-full"
                keyboardType="numeric"
                placeholder="Từ"
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(e.nativeEvent.text.replace(/[^0-9]/g, ''))}
              />
            </View>
            <View className="flex-1">
              <Input
                className="rounded-full"
                keyboardType="numeric"
                placeholder="Đến"
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(e.nativeEvent.text.replace(/[^0-9]/g, ''))}
              />
            </View>
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-base font-semibold">Năm sản xuất</Text>
          <Input
            className="rounded-full"
            keyboardType="numeric"
            placeholder="VD: 2022"
            value={localYear}
            onChange={(e) => setLocalYear(e.nativeEvent.text.replace(/[^0-9]/g, ''))}
          />
        </View>
      </ScrollView>

      <View className="flex-row gap-4 pb-4">
        <Button className="flex-1 rounded-full" variant="outline" onPress={handleClear}>
          <Text>Xóa lọc</Text>
        </Button>
        <Button className="flex-1 rounded-full" onPress={handleApply}>
          <Text>Áp dụng</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
