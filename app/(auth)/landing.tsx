import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ImageBackground } from 'expo-image';
import { Link } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LandingScreen() {
  return (
    <ImageBackground source={require('@/assets/images/background.png')} style={{ flex: 1 }}>
      <SafeAreaView className="dark flex-1 gap-8 bg-black/80 p-8">
        <View className="dark flex-1 justify-end">
          <Text className="text-6xl font-extrabold">Motohere</Text>
          <Text className="text-xl text-muted-foreground">Một chạm là có ngay chuyến đi chơi</Text>
        </View>
        <Link href="/(auth)/credentials/sign-in" asChild>
          <Button className="rounded-full">
            <Text>Đăng nhập</Text>
          </Button>
        </Link>
      </SafeAreaView>
    </ImageBackground>
  );
}
