import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/store/authStore';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SupportScreen() {
  const { signOut } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 gap-8 bg-background p-4 pt-20">
      <View className="flex-1 items-center justify-center">
        <Button onPress={signOut}>
          <Text>Đăng xuất</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
