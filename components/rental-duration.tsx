import { differenceInHours } from 'date-fns';
import { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from './ui/text';

interface RentalDurationProps {
  startTime: Date | null;
  endTime: Date | null;
}

export function RentalDuration({ startTime, endTime }: RentalDurationProps) {
  const durationText = useMemo(() => {
    if (!startTime || !endTime) return '';

    const diffHours = differenceInHours(endTime, startTime);
    const days = Math.floor(diffHours / 24);
    const hours = diffHours % 24;

    if (days === 0 && hours === 0) return '0 giờ';
    if (days === 0) return `${hours} giờ`;
    if (hours === 0) return `${days} ngày`;
    return `${days} ngày ${hours} giờ`;
  }, [startTime, endTime]);

  return (
    <View className="mt-6 items-center">
      <Text className="text-base text-gray-600">Thời gian thuê</Text>
      <Text className="mt-1 text-xl font-semibold text-gray-800">{durationText}</Text>
    </View>
  );
}
