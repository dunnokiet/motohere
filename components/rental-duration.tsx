import { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from './ui/text';

interface RentalDurationProps {
  startTime: Date | null;
  endTime: Date | null;
}

export function getRentalHours(startTime: Date, endTime: Date): number {
  const diffMs = endTime.getTime() - startTime.getTime();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60));
}

export function RentalDuration({ startTime, endTime }: RentalDurationProps) {
  const durationText = useMemo(() => {
    if (!startTime || !endTime) return '';

    const hours = getRentalHours(startTime, endTime);
    if (hours === 0) return '0 giờ';

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (days === 0) return `${remainingHours} giờ`;
    if (remainingHours === 0) return `${days} ngày`;
    return `${days} ngày ${remainingHours} giờ`;
  }, [startTime, endTime]);

  return (
    <View className="mt-6 items-center">
      <Text className="text-base text-gray-600">Thời gian thuê</Text>
      <Text className="mt-1 text-xl font-semibold text-gray-800">{durationText}</Text>
    </View>
  );
}
