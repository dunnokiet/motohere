import { IconMessageChatbot } from '@tabler/icons-react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Card, CardContent } from './ui/card';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

export function ChatCard() {
  return (
    <Pressable
      onPress={() => {
        router.push('/(main)/chat');
      }}>
      <Card className="rounded-3xl">
        <View className="absolute inset-0 overflow-hidden rounded-3xl bg-black">
          <Image
            source={require('@/assets/images/header.png')}
            style={{ width: '100%', height: '100%', opacity: 0.3 }}
            contentPosition="center"
          />
        </View>
        <CardContent>
          <View className="flex-row items-center gap-6">
            <View className="flex-1 items-end gap-1">
              <Text className="text-sm text-primary-foreground">
                Tìm xe nhanh cùng với trợ lý ảo
              </Text>
              <Text className="text-2xl font-bold text-sky-500">MotoAI</Text>
            </View>
            <Icon as={IconMessageChatbot} className="size-14 text-primary-foreground" />
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
}
