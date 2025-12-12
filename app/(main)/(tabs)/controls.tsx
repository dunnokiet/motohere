import { getListBikesOwner, type Bike } from '@/api/bikes';
import { Text } from '@/components/ui/text';
import { formatPrice } from '@/lib/formatters';
import { useAuthStore } from '@/store/authStore';
import * as React from 'react';
import { ActivityIndicator, FlatList, Image, View, Pressable } from 'react-native';
import { router } from 'expo-router';

export default function ControlsScreen() {
  const [bikes, setBikes] = React.useState<Bike[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { user } = useAuthStore();

  React.useEffect(() => {
    let cancelled = false;

    if (!user) return;

    const fetchBikes = async () => {
      try {
        setLoading(true);
        const { bikes } = await getListBikesOwner({}, user.userId, user.accessToken);

        if (!cancelled) {
          setBikes(bikes);
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
  }, [user]);

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
      <View className="mb-4 flex-row justify-end">
        <Pressable
          className="rounded-full bg-primary px-4 py-2"
          onPress={() => {
            router.push('/(main)/bikes/create');
          }}>
          <Text className="font-semibold text-primary-foreground">Thêm xe</Text>
        </Pressable>
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
                    <Text className="text-sm text-muted-foreground">{item.year}</Text>
                  </View>

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
