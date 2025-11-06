import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ImageBackground } from 'expo-image';
import { Link } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LandingScreen() {
  return (
    <ImageBackground source={require('@/assets/images/landing-background.png')} style={{ flex: 1 }}>
      <SafeAreaView className="dark flex-1 gap-4 bg-background/70 px-8">
        <View className="dark flex-1 justify-end">
          <Text className="text-6xl font-extrabold">Motohere</Text>
          <Text className="text-xl text-muted-foreground">Một chạm có ngay chuyến đi</Text>
        </View>
        <View className="gap-4">
          <Link href="/(auth)/credentials/sign-in" asChild>
            <Button className="rounded-full">
              <Text>Đăng nhập</Text>
            </Button>
          </Link>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
