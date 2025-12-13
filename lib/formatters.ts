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
  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());

  const offset = '+07:00';

  return `${year}-${month}-${day}T${hour}:${minute}:${second}${offset}`;
}

export function parseDateTime(dateStr: string): Date {
  return new Date(dateStr);
}

export function getDefaultTimeRange(): { startTime: string; endTime: string } {
  const now = new Date();

  const minStart = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const start = new Date(minStart);
  start.setMinutes(0, 0, 0);

  if (start.getHours() < 8) {
    start.setHours(8, 0, 0, 0);
  }

  const end = new Date(start);
  end.setDate(end.getDate() + 3);
  end.setHours(20, 0, 0, 0);

  return {
    startTime: formatDateTime(start),
    endTime: formatDateTime(end),
  };
}
