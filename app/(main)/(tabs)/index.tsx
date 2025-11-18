import { BrandsList } from '@/components/brands-list';
import { ChatCard } from '@/components/chat-card';
import { PopularBikesList } from '@/components/popular-bikes-list';
import { ProvincesList } from '@/components/provinces-list';
import { SearchCard } from '@/components/search-card';
import { ParallaxScrollView } from '@/components/ui/parallax-scrollview';
import { Text } from '@/components/ui/text';
import { ImageBackground } from 'expo-image';
import { View } from 'react-native';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerHeight={350}
      headerImage={
        <ImageBackground
          source={require('@/assets/images/header.png')}
          style={{ width: '100%', height: '100%' }}
          contentPosition="bottom center">
          <View className="dark flex-1 justify-end gap-2 bg-black/70 p-8 py-12">
            <Text>Chào mừng trở lại</Text>
            <Text className="text-4xl font-extrabold">MOTOHERE</Text>
          </View>
        </ImageBackground>
      }>
      <View className="mt-16 gap-8 bg-background px-4">
        <SearchCard />
        <ChatCard />
        <View className="gap-4">
          <View className="gap-1">
            <Text className="text-xl font-semibold">Các hãng xe</Text>
            <Text className="text-sm text-muted-foreground">Các hãng nổi tiếng ở Việt Nam</Text>
          </View>
          <BrandsList />
        </View>
        <View className="gap-4">
          <View className="gap-1">
            <Text className="text-xl font-semibold">Phổ biến nhất</Text>
            <Text className="text-sm text-muted-foreground">Những xe tốt giành cho bạn</Text>
          </View>
          <PopularBikesList />
        </View>
        <View className="gap-4">
          <View className="gap-1">
            <Text className="text-xl font-semibold">Địa điểm thuê xe</Text>
            <Text className="text-sm text-muted-foreground">
              Vị trí có lượng thuê xe nhiều nhất
            </Text>
          </View>
          <ProvincesList />
        </View>
      </View>
    </ParallaxScrollView>
  );
}
