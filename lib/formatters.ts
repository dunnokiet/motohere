import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export const formatPrice = (price: number | null) => {
  if (!price) return null;

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
};

export function formatRange(startTime: Date | null, endTime: Date | null) {
  if (!startTime || !endTime) return null;

  const day = (date: Date) =>
    format(date, 'EEE', { locale: vi }).replace('Thứ ', 'T').replace('Chủ Nhật', 'CN');

  const formatStartTime = `${format(startTime, 'HH:mm', { locale: vi })} ${day(startTime)}, ${format(startTime, 'dd/MM', { locale: vi })}`;
  const formatEndTime = `${format(endTime, 'HH:mm', { locale: vi })} ${day(endTime)}, ${format(endTime, 'dd/MM', { locale: vi })}`;

  return `${formatStartTime} - ${formatEndTime}`;
}

export function formatDateTime(date: Date): string {
  return date.toISOString().slice(0, 19);
}

export function parseDateTime(dateStr: string): Date {
  return new Date(dateStr);
}

export function getDefaultTimeRange(): { startTime: string; endTime: string } {
  const start = new Date();
  start.setHours(8, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 3);
  end.setHours(20, 0, 0, 0);

  return {
    startTime: formatDateTime(start),
    endTime: formatDateTime(end),
  };
}
