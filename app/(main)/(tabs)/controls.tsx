import { deleteBike, getListBikesOwner, type Bike } from '@/api/bikes';
import { FilterBar } from '@/components/search/filter-bar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatPrice } from '@/lib/formatters';
import { useAuthStore } from '@/store/authStore';
import { useSearchStore } from '@/store/searchStore';
import { IconDots, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Pressable, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export default function ControlsScreen() {
  const [bikes, setBikes] = React.useState<Bike[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const { user } = useAuthStore();
  const { brand, minPrice, maxPrice, year } = useSearchStore();

  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;

      if (!user) {
        setBikes([]);
        setError(null);
        return;
      }

      const fetchBikes = async () => {
        try {
          setLoading(true);
          const { bikes } = await getListBikesOwner(
            {
              brand: brand || undefined,
              minPrice: minPrice ?? undefined,
              maxPrice: maxPrice ?? undefined,
              year: year ?? undefined,
            },
            String(user.userId),
            user.accessToken
          );

          if (!cancelled) {
            setBikes(bikes);
            setError(null);
          }
        } catch (e: any) {
          if (!cancelled) {
            setError(e?.message ?? 'Có lỗi xảy ra');
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

      fetchBikes();

      return () => {
        cancelled = true;
      };
    }, [user, brand, minPrice, maxPrice, year])
  );

  const handleDelete = (bike: Bike) => {
    if (!bike.id || !user) return;

    Alert.alert('Xóa xe', 'Bạn có chắc chắn muốn xóa xe này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeletingId(String(bike.id));
            await deleteBike(String(bike.id), String(user.userId), user.accessToken);
            setBikes((prev) => prev.filter((b) => b.id !== bike.id));
          } catch (e: any) {
            Alert.alert('Lỗi', e?.message ?? 'Không thể xóa xe, vui lòng thử lại.');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background px-4 pb-4 pt-24">
      <View className="mb-4 flex-row items-center justify-between">
        <Button
          size="icon"
          className="rounded-full"
          onPress={() => {
            router.push('/(main)/bikes/create');
          }}>
          <Icon as={IconPlus} className="size-5 text-primary-foreground" />
        </Button>

        <Button
          size="icon"
          className="rounded-full"
          variant="ghost"
          onPress={() => router.push('/(main)/search/filters')}>
          <Icon as={IconDots} className="size-5" />
        </Button>
      </View>

      <View className="mb-4">
        <FilterBar />
      </View>

      {bikes.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-center text-muted-foreground">
            Chưa có xe nào. Hãy thêm xe mới để bắt đầu cho thuê.
          </Text>
        </View>
      ) : (
        <FlatList
          data={bikes}
          keyExtractor={(item) => String(item.id)}
          className="flex-1"
          contentContainerClassName="gap-4"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                if (!item.id) return;
                router.push({
                  pathname: '/(main)/bikes/[id]',
                  params: { id: String(item.id), mode: 'owner' },
                });
              }}>
              <View className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm shadow-black/5">
                <View className="h-40 w-full overflow-hidden bg-secondary">
                  {item.images?.[0]?.url && (
                    <Image
                      source={{ uri: item.images[0].url }}
                      style={{ width: '100%', height: '100%' }}
                    />
                  )}
                </View>

                <View className="gap-2 p-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-lg font-semibold">
                      {item.brand} {item.model}
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <Button
                        size="icon"
                        className="rounded-full"
                        variant="ghost"
                        onPress={() => {
                          if (!item.id) return;
                          router.push({
                            pathname: '/(main)/bikes/create',
                            params: { id: String(item.id), mode: 'edit' },
                          });
                        }}>
                        <Icon as={IconPencil} className="size-7 text-primary" />
                      </Button>

                      <Button
                        size="icon"
                        className="rounded-full"
                        variant="ghost"
                        disabled={deletingId === String(item.id)}
                        onPress={() => handleDelete(item)}>
                        <Icon as={IconTrash} className="size-7 text-destructive" />
                      </Button>
                    </View>
                  </View>
                  <Text className="text-sm text-muted-foreground">{item.year}</Text>

                  <View className="mt-1 flex-row items-baseline gap-1">
                    <Text className="text-lg font-semibold text-emerald-500">
                      {formatPrice(item.pricePerHour)}
                    </Text>
                    <Text className="text-xs text-muted-foreground">/ giờ</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
