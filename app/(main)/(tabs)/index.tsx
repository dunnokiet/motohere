import { Brand, BrandsList } from '@/components/brands-list';
import { PopularBikesList } from '@/components/popular-bikes-list';
import { PromotionLoginCard } from '@/components/promotion-login-card';
import { Province, ProvincesList } from '@/components/provinces-list';
import { SearchCard } from '@/components/search-card';
import { ParallaxScrollView } from '@/components/ui/parallax-scrollview';
import { Text } from '@/components/ui/text';
import { Bike } from '@/store/bikeStore';
import { Image } from 'expo-image';
import { View } from 'react-native';

export default function HomeScreen() {
  const handleBrandSelect = (brand: Brand) => {};

  const handleProvinceSelect = (province: Province) => {};

  const handleBikeSelect = (bike: Bike) => {};

  return (
    <ParallaxScrollView
      headerHeight={300}
      headerImage={
        <Image
          source={{
            uri: 'https://www.bikebound.com/wp-content/uploads/2022/12/Honda-NX650-Dominator-Baja-1.jpg',
          }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
      }>
      <View className="gap-8 bg-background px-4 pb-8">
        <SearchCard />
        <PromotionLoginCard />
        <BrandsList onBrandSelect={handleBrandSelect} />
      </View>
      <View className="gap-8 rounded-t-[32px] bg-primary px-4 pt-14">
        <View className="gap-4">
          <Text className="font-semibold text-primary-foreground">Phổ biến nhất</Text>
          <PopularBikesList onBikeSelect={handleBikeSelect} />
        </View>
        <View className="gap-4">
          <Text className="font-semibold text-primary-foreground">Địa điểm</Text>
          <ProvincesList onProvinceSelect={handleProvinceSelect} />
        </View>
      </View>
    </ParallaxScrollView>
  );
}
