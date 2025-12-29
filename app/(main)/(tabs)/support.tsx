import { ChatCard } from '@/components/chat-card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/store/authStore';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react-native';
import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FAQS = [
  {
    question: 'Làm sao để đặt xe?',
    answer:
      'Bạn chọn xe, chọn thời gian thuê và nhấn nút đặt xe. Sau đó làm theo hướng dẫn để hoàn tất.',
  },
  {
    question: 'Tôi cần giấy tờ gì để thuê xe?',
    answer: 'Bạn cần CCCD và bằng lái xe hợp lệ để thuê xe trên MotoHere.',
  },
  {
    question: 'Chính sách hủy đặt xe như thế nào?',
    answer: 'Hủy trước 24h hoàn tiền 100%, 12-24h hoàn 50%, dưới 12h không hoàn tiền.',
  },
];

export default function SupportScreen() {
  const { signOut } = useAuthStore();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-background px-4 pt-20">
      <View className="mb-8">
        <Text className="mb-4 font-bold">Câu hỏi thường gặp</Text>
        <View className="gap-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <View
                key={idx}
                className="overflow-hidden rounded-3xl border border-border bg-secondary shadow">
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="flex-row items-center justify-between px-6 py-4"
                  onPress={() => setOpenIndex(isOpen ? null : idx)}>
                  <Text className="text-base font-semibold">{faq.question}</Text>
                  <Icon
                    as={isOpen ? IconChevronUp : IconChevronDown}
                    className="size-5 text-muted-foreground"
                  />
                </TouchableOpacity>
                {isOpen && (
                  <View className="px-6 pb-4">
                    <Text className="text-base text-muted-foreground">{faq.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>
      <View className="mb-8 mt-auto">
        <Text className="mb-2 font-bold">Vẫn còn thắc mắc?</Text>
        <ChatCard />
      </View>
    </SafeAreaView>
  );
}
