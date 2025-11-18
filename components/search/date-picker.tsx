import { BottomSheet, useBottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import {
  IconArrowRight,
  IconCalendarClock,
  IconCalendarEvent,
  IconCalendarWeek,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
} from '@tabler/icons-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Text } from '../ui/text';

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

// Conditional typing based on mode
interface BaseDatePickerProps {
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  style?: ViewStyle;
  minimumDate?: Date;
  maximumDate?: Date;
  timeFormat?: '12' | '24';
  className?: string;
}

interface DatePickerPropsRange extends BaseDatePickerProps {
  mode: 'range';
  value?: DateRange;
  onChange?: (value: DateRange | null) => void;
}

interface DatePickerPropsDate extends BaseDatePickerProps {
  mode?: 'date' | 'time' | 'datetime';
  value?: Date;
  onChange?: (value: Date | null) => void;
}

export type DatePickerProps = DatePickerPropsRange | DatePickerPropsDate;

const MONTHS = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
];

// Vietnamese short day names: CN (Chủ Nhật), T2..T7 (Thứ 2..Thứ 7)
const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

// Generate year range (current year ± 50 years)
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 101 }, (_, i) => currentYear - 50 + i);

// Type guard to check if value is DateRange
const isDateRange = (value: Date | DateRange | undefined): value is DateRange => {
  return (
    value !== undefined &&
    typeof value === 'object' &&
    value !== null &&
    'startDate' in value &&
    'endDate' in value
  );
};

export function DatePicker(props: DatePickerProps) {
  const {
    placeholder = 'Chọn ngày',
    disabled = false,
    minimumDate,
    maximumDate,
    timeFormat = '24',
  } = props;

  const mode = props.mode || 'date';
  const value = props.value;
  const onChange = props.onChange;

  const { isVisible, open, close } = useBottomSheet();

  // Get the current date for navigation, prioritizing single date or range start date
  const getCurrentDate = useCallback(() => {
    if (mode === 'range') {
      const rangeValue = isDateRange(value) ? value : { startDate: null, endDate: null };
      return rangeValue.startDate || new Date();
    }
    return (value as Date) || new Date();
  }, [value, mode]);

  const [currentDate, setCurrentDate] = useState(() => getCurrentDate());
  const [viewMode, setViewMode] = useState<'date' | 'time' | 'month' | 'year'>('date');
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const monthScrollRef = useRef<ScrollView>(null);
  const yearScrollRef = useRef<ScrollView>(null);

  // Range selection state for temporary storage during selection
  const [tempRange, setTempRange] = useState<DateRange>(() =>
    mode === 'range' && isDateRange(value) ? value : { startDate: null, endDate: null }
  );

  const formatDisplayValue = useCallback(() => {
    if (mode === 'range') {
      const rangeValue = isDateRange(value) ? value : { startDate: null, endDate: null };

      if (!rangeValue.startDate && !rangeValue.endDate) {
        return placeholder;
      }

      const startStr = rangeValue.startDate ? rangeValue.startDate.toLocaleDateString() : '';
      const endStr = rangeValue.endDate ? rangeValue.endDate.toLocaleDateString() : '';

      if (startStr && endStr) {
        return `${startStr} - ${endStr}`;
      } else if (startStr) {
        return `${startStr} - Chọn ngày kết thúc`;
      } else if (endStr) {
        return `Chọn ngày bắt đầu - ${endStr}`;
      }
      return placeholder;
    }

    const dateValue = value as Date;
    if (!dateValue) return placeholder;

    switch (mode) {
      case 'time':
        if (timeFormat === '12') {
          return dateValue.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
        }
        return dateValue.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      case 'datetime':
        const timeStr =
          timeFormat === '12'
            ? dateValue.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })
            : dateValue.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              });
        return `${dateValue.toLocaleDateString()} ${timeStr}`;
      default:
        return dateValue.toLocaleDateString();
    }
  }, [value, mode, placeholder, timeFormat]);

  // Helper function to check if a time is disabled based on min/max dates
  const isTimeDisabled = useCallback(
    (hour: number) => {
      const checkDate = new Date(currentDate);
      checkDate.setHours(hour, 0, 0, 0);

      if (minimumDate) {
        const min = new Date(minimumDate);

        const currentDateOnly = new Date(currentDate);
        currentDateOnly.setHours(0, 0, 0, 0);
        const minDateOnly = new Date(minimumDate);
        minDateOnly.setHours(0, 0, 0, 0);

        if (currentDateOnly.getTime() === minDateOnly.getTime()) {
          let minHour = min.getHours();
          if (min.getMinutes() > 0) {
            minHour += 1;
          }

          if (hour < minHour) return true;
        }
      }

      if (maximumDate) {
        const max = new Date(maximumDate);

        const currentDateOnly = new Date(currentDate);
        currentDateOnly.setHours(0, 0, 0, 0);
        const maxDateOnly = new Date(maximumDate);
        maxDateOnly.setHours(0, 0, 0, 0);

        if (currentDateOnly.getTime() === maxDateOnly.getTime()) {
          let maxHour = max.getHours();
          if (hour > maxHour) return true;
        }
      }

      return false;
    },
    [currentDate, minimumDate, maximumDate]
  );

  // Helper function to check if a date is disabled
  const isDateDisabled = useCallback(
    (date: Date) => {
      const current = new Date(date);
      current.setHours(0, 0, 0, 0);

      const min = minimumDate ? new Date(minimumDate) : null;
      const max = maximumDate ? new Date(maximumDate) : null;

      if (min) min.setHours(0, 0, 0, 0);
      if (max) max.setHours(0, 0, 0, 0);

      if (min && current < min) return true;
      if (max && current > max) return true;

      return false;
    },
    [minimumDate, maximumDate]
  );

  // Helper function to check if a date is in range
  const isDateInRange = useCallback(
    (date: Date) => {
      if (mode !== 'range' || !tempRange.startDate || !tempRange.endDate) {
        return false;
      }

      // Create new date objects to avoid mutation
      const startDate = new Date(tempRange.startDate);
      const endDate = new Date(tempRange.endDate);
      const checkDate = new Date(date);

      // Normalize dates for comparison (remove time)
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      checkDate.setHours(0, 0, 0, 0);

      return checkDate >= startDate && checkDate <= endDate;
    },
    [mode, tempRange]
  );

  // Helper function to check if a date is a range endpoint
  const isRangeEndpoint = useCallback(
    (date: Date) => {
      if (mode !== 'range') {
        return { isStart: false, isEnd: false };
      }

      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      const isStart =
        tempRange.startDate &&
        new Date(tempRange.startDate).setHours(0, 0, 0, 0) === normalizedDate.getTime();
      const isEnd =
        tempRange.endDate &&
        new Date(tempRange.endDate).setHours(0, 0, 0, 0) === normalizedDate.getTime();

      return { isStart: !!isStart, isEnd: !!isEnd };
    },
    [mode, tempRange]
  );

  // Memoized calendar calculations
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Create calendar grid with proper positioning
    const weeks: (number | null)[][] = [];
    let currentWeek: (number | null)[] = [];

    // Fill empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);

      // If week is complete (7 days) or it's the last day, start a new week
      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    }

    // Add the last incomplete week if it exists
    if (currentWeek.length > 0) {
      // Fill remaining cells with null
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return { weeks, year, month, daysInMonth };
  }, [currentDate]);

  useEffect(() => {
    if (showMonthPicker && monthScrollRef.current) {
      const itemHeight = 54;
      monthScrollRef.current.scrollTo({
        y: calendarData.month * itemHeight,
        animated: false,
      });
    }
  }, [showMonthPicker, calendarData.month]);

  useEffect(() => {
    if (showYearPicker && yearScrollRef.current) {
      const itemHeight = 54;
      const index = YEARS.indexOf(calendarData.year);
      if (index !== -1) {
        yearScrollRef.current.scrollTo({
          y: index * itemHeight,
          animated: false,
        });
      }
    }
  }, [showYearPicker, calendarData.year]);

  const handleRangeSelect = (day: number) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

    // Check if date is disabled
    if (isDateDisabled(selectedDate)) return;

    // If no start date or both dates are selected, start fresh
    if (!tempRange.startDate || (tempRange.startDate && tempRange.endDate)) {
      setTempRange({
        startDate: selectedDate,
        endDate: null,
      });
    } else {
      // We have a start date but no end date
      const startDate = tempRange.startDate;

      if (selectedDate < startDate) {
        // If selected date is before start date, make it the new start date
        setTempRange({
          startDate: selectedDate,
          endDate: null,
        });
      } else {
        // Selected date is after start date, make it the end date
        setTempRange({
          startDate: startDate,
          endDate: selectedDate,
        });
      }
    }
  };

  const handleDateSelect = (day: number) => {
    if (mode === 'range') {
      handleRangeSelect(day);
      return;
    }

    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

    // Check if date is disabled
    if (isDateDisabled(newDate)) return;

    setCurrentDate(newDate);

    if (mode === 'date') {
      (onChange as (value: Date | undefined) => void)?.(newDate);
      close();
    } else if (mode === 'datetime') {
      setViewMode('time');
    }
  };

  const handleTimeChange = (hours: number, minutes: number) => {
    const newDate = new Date(currentDate);
    newDate.setHours(hours, minutes, 0, 0);
    setCurrentDate(newDate);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    setCurrentDate(newDate);
    setShowMonthPicker(false);
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
    setShowYearPicker(false);
  };

  const handleConfirm = () => {
    const roundHours = (date: Date) => {
      const temp = new Date(date.getTime());
      let hours = temp.getHours();
      const minutes = temp.getMinutes();

      if (minutes > 0) {
        hours += 1;
        if (hours === 24) {
          temp.setDate(temp.getDate() + 1);
          hours = 0;
        }
      }

      temp.setHours(hours, 0, 0, 0);
      return temp;
    };

    if (mode === 'range') {
      const now = new Date();
      const roundedNow = roundHours(now);

      const roundedRange =
        tempRange && tempRange.startDate && tempRange.endDate
          ? {
              startDate: roundHours(tempRange.startDate),
              endDate: roundHours(tempRange.endDate),
            }
          : undefined;

      roundedRange?.startDate.setHours(roundedNow.getHours());

      (onChange as (value: DateRange | undefined) => void)?.(roundedRange);
    } else {
      const roundedDate = currentDate ? roundHours(currentDate) : undefined;
      (onChange as (value: Date | undefined) => void)?.(roundedDate);
    }

    close();
  };

  const resetToToday = () => {
    const today = new Date();
    setCurrentDate(today);

    if (mode === 'range') {
      setTempRange({ startDate: today, endDate: null });
    } else if (mode === 'date' || mode === 'datetime') {
      (onChange as (value: Date | undefined) => void)?.(today);
    }
  };

  const renderMonthYearHeader = () => (
    <View className="mb-6 flex-row items-center justify-between gap-4">
      <Button
        size="icon"
        variant="secondary"
        className="rounded-full"
        onPress={() => navigateMonth('prev')}>
        <Icon as={IconChevronLeft} className="size-4" />
      </Button>

      <Button
        variant="secondary"
        className="flex-1 rounded-full"
        onPress={() => setShowMonthPicker(true)}>
        <Text>{MONTHS[calendarData.month]}</Text>
      </Button>
      <Button
        variant="secondary"
        className="flex-1 rounded-full"
        onPress={() => setShowYearPicker(true)}>
        <Text>{calendarData.year}</Text>
      </Button>

      <Button
        size="icon"
        variant="secondary"
        className="rounded-full"
        onPress={() => navigateMonth('next')}>
        <Icon as={IconChevronRight} className="size-4" />
      </Button>
    </View>
  );

  const renderCalendar = () => (
    <View>
      {renderMonthYearHeader()}
      {/* Day headers */}
      <View className="mb-4 flex-row">
        {DAYS.map((day) => (
          <View key={day} className="flex-1 items-center">
            <Text className="text-sm text-muted-foreground">{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View>
        {calendarData.weeks.map((week, weekIndex) => (
          <View key={weekIndex} className="mb-2 flex-row">
            {week.map((day, dayIndex) => {
              const dayDate = day ? new Date(calendarData.year, calendarData.month, day) : null;

              const isSelected =
                day &&
                value &&
                !isDateRange(value) &&
                value.getDate() === day &&
                value.getMonth() === calendarData.month &&
                value.getFullYear() === calendarData.year;

              const isToday =
                day &&
                new Date().getDate() === day &&
                new Date().getMonth() === calendarData.month &&
                new Date().getFullYear() === calendarData.year;

              const disabled = dayDate ? isDateDisabled(dayDate) : false;

              // Range-specific styling
              const inRange = dayDate ? isDateInRange(dayDate) : false;
              const rangeEndpoints = dayDate
                ? isRangeEndpoint(dayDate)
                : { isStart: false, isEnd: false };

              return (
                <View
                  key={dayIndex}
                  className={cn(
                    'flex-1 items-center',
                    mode === 'range' && inRange && 'bg-primary',
                    rangeEndpoints.isStart && 'rounded-l-full',
                    rangeEndpoints.isEnd && 'rounded-r-full'
                  )}>
                  {day ? (
                    <TouchableOpacity
                      onPress={() => !disabled && handleDateSelect(day)}
                      disabled={disabled}
                      className={cn(
                        'h-10 w-10 items-center justify-center border-primary',
                        rangeEndpoints.isStart || rangeEndpoints.isEnd
                          ? 'rounded-none'
                          : 'rounded-full',
                        (rangeEndpoints.isStart || rangeEndpoints.isEnd || inRange || isSelected) &&
                          'bg-primary',
                        isToday && !isSelected && !inRange ? 'border' : 'border-0',
                        rangeEndpoints.isStart && 'rounded-l-full',
                        rangeEndpoints.isEnd && 'rounded-r-full',
                        disabled && 'opacity-30'
                      )}>
                      <Text
                        className={cn(
                          (rangeEndpoints.isStart ||
                            rangeEndpoints.isEnd ||
                            inRange ||
                            isSelected) &&
                            'text-primary-foreground',
                          disabled && 'text-muted-foreground',
                          (rangeEndpoints.isStart ||
                            rangeEndpoints.isEnd ||
                            isSelected ||
                            inRange ||
                            isToday) &&
                            'font-medium'
                        )}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View className="h-10 w-10" />
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* Range selection info */}
      {mode === 'range' && (
        <View className="mt-4 flex-row items-center rounded-xl bg-secondary p-6">
          <Text className="flex-1 text-center text-xl">
            {tempRange.startDate ? `${tempRange.startDate.toLocaleDateString()}` : 'Ngày bắt đầu'}
          </Text>

          <View className="flex-[0.1] items-center justify-center">
            <Icon as={IconArrowRight} className="size-6 text-foreground" />
          </View>

          <Text className="flex-1 text-center text-xl">
            {tempRange.endDate ? `${tempRange.endDate.toLocaleDateString()}` : 'Ngày kết thúc'}
          </Text>
        </View>
      )}
    </View>
  );

  const renderTimePicker = () => {
    const selectedHours = Math.ceil(currentDate.getHours() + currentDate.getMinutes() / 60);
    const isPM = selectedHours >= 12;

    return (
      <View className="h-[400px]">
        <View className="flex-1 flex-row gap-4">
          {/* Hours */}
          <View className="flex-1">
            <Text className="mb-4 text-center text-muted-foreground">Giờ</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {Array.from({ length: timeFormat === '12' ? 12 : 24 }, (_, i) =>
                timeFormat === '12' ? (i === 0 ? 12 : i) : i
              ).map((hour) => {
                const actualHour =
                  timeFormat === '12'
                    ? hour === 12
                      ? isPM
                        ? 12
                        : 0
                      : isPM
                        ? hour + 12
                        : hour
                    : hour;

                const isSelected = actualHour === selectedHours;
                const isDisabled = isTimeDisabled(actualHour);

                return (
                  <Button
                    key={hour}
                    onPress={() => handleTimeChange(actualHour, 0)}
                    variant={isSelected ? 'secondary' : 'ghost'}
                    className="my-2 rounded-full"
                    disabled={isDisabled}>
                    <Text>{hour.toString().padStart(2, '0')}</Text>
                  </Button>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </View>
    );
  };

  const renderMonthPicker = () => {
    return (
      <View className="h-[400px]">
        <ScrollView ref={monthScrollRef} showsVerticalScrollIndicator={false}>
          {MONTHS.map((month, index) => (
            <Button
              key={month}
              onPress={() => handleMonthSelect(index)}
              variant={index === calendarData.month ? 'secondary' : 'ghost'}
              className="my-2 rounded-full">
              <Text>{month}</Text>
            </Button>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderYearPicker = () => {
    return (
      <View className="h-[400px]">
        <ScrollView ref={yearScrollRef} showsVerticalScrollIndicator={false}>
          {YEARS.map((year) => (
            <Button
              key={year}
              onPress={() => handleYearSelect(year)}
              variant={year === calendarData.year ? 'secondary' : 'ghost'}
              className="my-2 rounded-full">
              <Text>{year}</Text>
            </Button>
          ))}
        </ScrollView>
      </View>
    );
  };

  const getBottomSheetContent = () => {
    if (showMonthPicker) return renderMonthPicker();
    if (showYearPicker) return renderYearPicker();
    if (mode === 'datetime') return viewMode === 'date' ? renderCalendar() : renderTimePicker();
    if (mode === 'time') return renderTimePicker();
    return renderCalendar();
  };

  const getBottomSheetTitle = () => {
    if (showMonthPicker) return 'Chọn tháng';
    if (showYearPicker) return 'Chọn năm';

    if (mode === 'datetime') {
      return viewMode === 'date' ? 'Chọn ngày' : 'Chọn giờ';
    }

    if (mode === 'time') return 'Chọn giờ';

    if (mode === 'range') return 'Chọn khoảng ngày';

    return 'Chọn ngày';
  };

  const handleOpenPicker = () => {
    setCurrentDate(new Date());
    setViewMode('date');
    setShowMonthPicker(false);
    setShowYearPicker(false);
    open();
  };

  return (
    <View>
      <Button
        onPress={handleOpenPicker}
        disabled={disabled}
        variant="secondary"
        className="justify-start rounded-full">
        {mode === 'time' ? (
          <Icon as={IconClock} className="size-5" />
        ) : mode === 'datetime' ? (
          <Icon as={IconCalendarClock} className="size-5" />
        ) : mode === 'range' ? (
          <Icon as={IconCalendarEvent} className="size-5" />
        ) : (
          <Icon as={IconCalendarWeek} className="size-5" />
        )}

        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className={cn(!value && 'text-muted-foreground')}>
          {formatDisplayValue()}
        </Text>
      </Button>

      <BottomSheet
        isVisible={isVisible}
        onClose={() => {
          close();
          setShowMonthPicker(false);
          setShowYearPicker(false);
        }}
        title={getBottomSheetTitle()}
        snapPoints={[0.8]}>
        <View className="flex-1">
          {getBottomSheetContent()}

          <View className="flex-row items-center justify-between gap-3 pt-6">
            <Button
              variant="outline"
              onPress={resetToToday}
              className="rounded-full border-primary">
              <Text>Hiện tại</Text>
            </Button>

            {mode === 'datetime' && viewMode === 'date' ? (
              <Button onPress={() => setViewMode('time')} className="flex-1 rounded-full">
                <Text>Tiếp tục</Text>
              </Button>
            ) : (
              <Button
                onPress={handleConfirm}
                className="flex-1 rounded-full"
                disabled={
                  mode === 'range' &&
                  (!tempRange.endDate ||
                    tempRange.startDate?.getDate() === tempRange.endDate?.getDate())
                }>
                <Text>Xong</Text>
              </Button>
            )}
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}
