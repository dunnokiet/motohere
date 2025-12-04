const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface Bikes {
  ownerId: number;
  brand: string;
  model: string;
  licensePlate: string;
  year: number;
  pricePerHour: number;
  location: Location;
}

export interface Location {
  name: string;
  province: string;
  ward: string;
  latitude: number;
  longitude: number;
}

export const createBikes = async (
  car: Object,
  images: File[],
  accessToken: string | null
): Promise<void> => {
  if (!accessToken) throw new Error('No access token');

  const formData = new FormData();

  formData.append(
    'car',
    new Blob([JSON.stringify(car)], {
      type: 'application/json',
    })
  );

  images.forEach((image) => {
    formData.append('images', image);
  });

  const response = await fetch(`${API_URL}/managemention-cars/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok || result.status !== 200) {
    throw new Error(result.message[0]);
  }
};

export const deleteBike = async (
  carId: string,
  ownerId: string,
  accessToken: string
): Promise<void> => {
  if (!accessToken) throw new Error('No access token');

  const data = {
    carId,
    ownerId,
  };

  const response = await fetch(`${API_URL}/managemention-cars/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok || result.status !== 200) {
    throw new Error(result.message[0]);
  }
};
