import { FilterBar } from '@/components/search/filter-bar';
import { ResultsList } from '@/components/search/results-list';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Results() {
  return (
    <SafeAreaView className="flex-1 gap-8 bg-background px-4 pt-20">
      <FilterBar />
      <ResultsList />
    </SafeAreaView>
  );
}
