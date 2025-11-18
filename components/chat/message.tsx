import { UIMessage } from 'ai';
import { Fragment } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export function Message({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user';

  const content = message.parts
    .map((part) => {
      switch (part.type) {
        case 'text': {
          if (isUser) {
            return <UserMessage part={part} />;
          }
          return <Text>{part.text}</Text>;
        }
        case 'tool-seachBikes': {
          const { state } = part;

          if (state === 'result') {
          }
        }
        default:
          return null;
      }
    })
    .filter(Boolean);

  return (
    <View className="gap-2">
      {content.map((jsx, key) => (
        <Fragment key={key}>{jsx}</Fragment>
      ))}
    </View>
  );
}

export function UserMessage({ part }: { part: { type: string; text: string } }) {
  return (
    <Animated.View entering={FadeIn} className="flex flex-row justify-end">
      <View
        className="rounded-full border border-border bg-secondary px-4 py-2"
        style={{ borderCurve: 'continuous' }}>
        <Text className="font-medium">{part.text}</Text>
      </View>
    </Animated.View>
  );
}
