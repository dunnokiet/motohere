import { DateTimeForm } from '@/components/search/date-time-form';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DateTimeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background p-4 pt-20">
      <DateTimeForm />
    </SafeAreaView>
  );
}
