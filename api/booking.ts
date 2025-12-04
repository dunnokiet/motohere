const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface Booking {
  carId: number;
  customerId: number;
  startTime: string;
  endTime: string;
  totalPrice: number;
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
