import { useBottomTabOverflow } from '@/hooks/useBottomTabOverflow';
import type { PropsWithChildren, ReactElement } from 'react';
import { View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

type Props = PropsWithChildren<{
  headerHeight?: number;
  headerImage: ReactElement;
}>;

export function ParallaxScrollView({ children, headerHeight = 250, headerImage }: Props) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useSharedValue(0);
  const bottom = useBottomTabOverflow();

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-headerHeight, 0, headerHeight],
            [-headerHeight / 2, 0, headerHeight * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-headerHeight, 0, headerHeight], [2, 1, 1]),
        },
      ],
    };
  });

  return (
    <View className="flex-1 bg-background">
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}>
        <Animated.View
          style={[
            {
              height: headerHeight,
            },
            headerAnimatedStyle,
          ]}>
          {headerImage}
        </Animated.View>
        <View className="flex-1">{children}</View>
      </Animated.ScrollView>
    </View>
  );
}
