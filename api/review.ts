const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface Review {
  bookingId: number;
  reviewId?: number;
  rating: number;
  reviewText: string;
}

export const createReview = async (review: Review, accessToken: string | null) => {
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_URL}/review-booking/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(review),
  });

  const result = await response.json();

  if (!response.ok || result.status !== 200) {
    throw new Error(result.message[0]);
  }
};

export const updateReview = async (review: Review, accessToken: string | null) => {
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_URL}/review-booking/update`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(review),
  });

  const result = await response.json();

  if (!response.ok || result.status !== 200) {
    throw new Error(result.message[0]);
  }
};

