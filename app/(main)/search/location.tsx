import { ProvincesList } from '@/components/search/provinces-list';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LocationScreens() {
  return (
    <SafeAreaView className="flex-1 gap-8 bg-background p-4 pt-20">
      <Input className="rounded-full" placeholder="Nhập địa điểm" />
      <Text>Tỉnh thành hiển thị danh sách xe</Text>
      <ProvincesList />
    </SafeAreaView>
  );
}
