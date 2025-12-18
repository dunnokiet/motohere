import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatRange } from '@/lib/formatters';
import { useSearchStore } from '@/store/searchStore';
import { IconChevronLeft, IconDots, IconSearch, IconX } from '@tabler/icons-react-native';
import { Link, Stack } from 'expo-router';
import { Pressable, View } from 'react-native';

export default function SearchLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Tìm xe',
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="results"
        options={{
          header: () => <ResultsHeader />,
        }}
      />
      <Stack.Screen
        name="location"
        options={{
          title: 'Địa điểm',
          headerLeft: () => <CloseButton />,
        }}
      />
      <Stack.Screen
        name="date-time"
        options={{
          title: 'Thời gian thuê',
          headerLeft: () => <CloseButton />,
        }}
      />
      <Stack.Screen
        name="filters"
        options={{
          title: 'Bộ lọc',
          headerLeft: () => <CloseButton />,
        }}
      />
    </Stack>
  );
}

const ResultsHeader = () => {
  return (
    <View className="top-safe abosolute left-0 right-0 flex-row justify-between gap-3 px-4">
      <CloseButton />
      <SearchBar />
      <FilterButton />
    </View>
  );
};

const SearchBar = () => {
  const { startTime, endTime, location } = useSearchStore();

  return (
    <Link href="/(main)/search" asChild>
      <Button className="flex-1 justify-start rounded-full" variant="secondary">
        <Icon as={IconSearch} className="size-5" />
        <View>
          <Text className="text-xs">{location?.province}</Text>
          <Text className="text-xs text-muted-foreground">{formatRange(startTime, endTime)}</Text>
        </View>
      </Button>
    </Link>
  );
};

const CloseButton = () => {
  return (
    <Link href=".." asChild>
      <Pressable className="justify-center px-2">
        <Icon as={IconX} className="size-5 text-foreground" />
      </Pressable>
    </Link>
  );
};

const FilterButton = () => {
  return (
    <Link href="/(main)/search/filters" asChild>
      <Button size="icon" className="rounded-full" variant="ghost">
        <Icon as={IconDots} className="size-5" />
      </Button>
    </Link>
  );
};

const BackButton = () => {
  return (
    <Link href=".." asChild>
      <Pressable className="px-2">
        <Icon as={IconChevronLeft} className="size-5 text-foreground" />
      </Pressable>
    </Link>
  );
};
