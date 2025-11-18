import { Message } from '@/components/chat/message';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { KeyboardPaddingView } from '@/components/ui/keyboard-padding';
import { generateAPIUrl } from '@/lib/generators';
import { useAuthStore } from '@/store/authStore';
import { useChat } from '@ai-sdk/react';
import { IconSend } from '@tabler/icons-react-native';
import { DefaultChatTransport } from 'ai';
import { fetch as expoFetch } from 'expo/fetch';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatScreen() {
  const { user } = useAuthStore();

  const scrollViewRef = useRef<ScrollView>(null);

  const [input, setInput] = useState('');

  const { messages, error, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: generateAPIUrl('/api/chat'),
    }),
    onError: (error) => console.error(error, 'ERROR'),
  });

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage({ text: input }, { body: { accessToken: user?.accessToken } });
    setInput('');
  };

  return (
    <SafeAreaView className="flex-1 bg-background pt-20">
      <ScrollView
        ref={scrollViewRef}
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustContentInsets
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 p-4 pb-8"
        className="flex-1">
        {messages.map((m) => (
          <Message key={m.id} message={m} />
        ))}

        <KeyboardPaddingView />
      </ScrollView>

      <View className="absolute inset-x-0 bottom-0 bg-secondary">
        <View className="m-4 flex-row gap-4">
          <View className="flex-1">
            <Input
              className="rounded-full"
              placeholder="Hỏi bất cứ điều gì"
              value={input}
              onChange={(e) => setInput(e.nativeEvent.text)}
              onSubmitEditing={(e) => {
                e.preventDefault();
                handleSend();
              }}
              autoFocus
            />
          </View>
          <Button className="rounded-full" size="icon" onPress={handleSend}>
            <Icon as={IconSend} className="size-4 text-primary-foreground" />
          </Button>
        </View>
        <KeyboardPaddingView />
      </View>
    </SafeAreaView>
  );
}
