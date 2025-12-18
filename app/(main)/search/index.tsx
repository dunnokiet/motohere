import { Searchform } from '@/components/search/search-form';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
  return (
    <SafeAreaView className="flex-1 gap-4 bg-background px-4 pt-20">
      <Searchform />
    </SafeAreaView>
  );
}
