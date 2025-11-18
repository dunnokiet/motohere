import { Bike } from '@/api/bikes';
import { formatPrice } from '@/lib/formatters';
import { IconCornerUpRight } from '@tabler/icons-react-native';
import { ImageBackground } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, View, ViewProps } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Badge } from '../ui/badge';
import { Icon } from '../ui/icon';
import { Text } from '../ui/text';

function ToolCard(props: ViewProps) {
  return (
    <Animated.View
      entering={FadeIn}
      className="gap rounded-2xl border border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-4 transition-all duration-200 hover:from-gray-100 hover:to-gray-200"
      style={{ borderCurve: 'continuous' }}
      {...props}
    />
  );
}

export function BikesListCard({ bikes }: { bikes: Bike[] }) {
  const handlePress = (id: string) => {
    router.push(`/(main)/bikes/${id}`);
  };

  return (
    <ToolCard>
      <View className="-mx-4 flex-1">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={336}
          decelerationRate="fast"
          contentContainerClassName="px-4 gap-4">
          {bikes.map((bike) => (
            <Pressable key={bike.id} onPress={() => handlePress(bike.id)}>
              <View className="h-80 w-80 rounded-3xl border border-border bg-background shadow-sm shadow-black/5">
                <View className="m-2 mb-0 flex-1 overflow-hidden rounded-2xl bg-secondary">
                  {bike.images.length > 0 && (
                    <ImageBackground
                      source={{
                        uri: bike.images[0].url,
                      }}
                      style={{ width: '100%', height: '100%' }}
                      contentPosition="bottom center"
                      contentFit="cover">
                      <View className="m-4 flex-1 items-end justify-end">
                        <Badge variant="secondary" className="rounded-full">
                          <Icon as={IconCornerUpRight} />
                          <Text>{bike.distance}km</Text>
                        </Badge>
                      </View>
                    </ImageBackground>
                  )}
                </View>
                <View className="flex-row items-end justify-between p-4">
                  <View className="flex-1 gap-0.5">
                    <Text className="font-medium">{`${bike.model}`}</Text>
                    <Text className="text-sm text-muted-foreground">{bike.year}</Text>
                  </View>
                  <View className="items-end gap-0.5">
                    <Text className="font-medium text-emerald-700">
                      {formatPrice(bike.pricePerHour)}
                    </Text>
                    <Text className="text-sm">/ ngày</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </ToolCard>
  );
}
