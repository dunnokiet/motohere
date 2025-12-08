import { Bike, parseImages } from './bikes';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface Booking {
  bookingId?: string;
  carId?: number;
  customerId?: number;
  car?: Bike;
  startTime: string;
  endTime: string;
  totalPrice: number;
}

export interface Review {
  id: number;
  bookingId: number;
  rating: number;
  comment: string;
  createAt: string;
}

export interface BookingDetail {
  car: Bike;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
  review: Review[];
}

export interface BookingParams {
  startTime: string;
  endTime: string;
}

export const createBooking = async (
  booking: Booking,
  accessToken: string | null
): Promise<void> => {
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_URL}/rention/booking`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(booking),
  });

  const result = await response.json();

  if (!response.ok || result.status !== 200) {
    throw new Error(result.message[0]);
  }
};

export const cancelBooking = async (id: number, accessToken: string | null): Promise<void> => {
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_URL}/rention/booking/${id}/cancel`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const result = await response.json();

  if (!response.ok || result.status !== 200) {
    throw new Error(result.message[0]);
  }
};

export const confirmBooking = async (id: number, accessToken: string | null) => {
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_URL}/rention/booking/${id}/confirm`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const result = await response.json();

  if (!response.ok || result.status !== 200) {
    throw new Error(result.message[0]);
  }
};

export async function getListsBookings(
  params: BookingParams,
  accessToken: string | null
): Promise<{ bookings: Booking[] }> {
  if (!accessToken) throw new Error('No access token');

  const queryParams = new URLSearchParams();

  if (params.startTime) queryParams.append('startTime', params.startTime);
  if (params.endTime) queryParams.append('endTime', params.endTime);

  const response = await fetch(`${API_URL}/retion/bookings?${queryParams.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const result = await response.json();
  if (!response.ok || result.status !== 200) {
    throw new Error(result.message[0]);
  }

  const bookings: Booking[] = result.data.map((booking: any) => ({
    ...booking,
    images: parseImages(booking.car.images),
  }));

  return { bookings };
}

export async function getDetailBookings(id: string, accessToken: string | null) {
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_URL}/rention/booking/${id}/detail`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const result = await response.json();

  if (!response.ok || result.status !== 200) {
    throw new Error(result.message[0]);
  }

  const bookingDetail: BookingDetail = {
    ...result.data,
    images: parseImages(result.data.images),
  };

  return { bookingDetail };
}
