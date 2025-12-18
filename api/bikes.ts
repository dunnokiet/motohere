import { getDefaultTimeRange } from '@/lib/formatters';
import { generateAPIUrl } from '@/lib/generators';

const API_URL = process.env.EXPO_PUBLIC_API_URL!;

export interface BikeImage {
  id: string;
  url: string;
}

export interface Location {
  name: string;
  province: string;
  ward: string;
  latitude?: number;
  longitude?: number;
}

export interface Bike {
  id?: string;
  ownerId?: number;
  brand: string;
  model: string;
  licensePlate?: string;
  year: number;
  pricePerHour: number;
  images: BikeImage[];
  distance?: number;
  locationName?: string;
  province?: string;
  ward?: string;
  longitude?: number;
  latitude?: number;
}

export interface Review {}

export interface BikeDetail {
  ownerId: number;
  username?: string;
  phoneNumber?: string;
  brand: string;
  model: string;
  licensePlate: string;
  year: number;
  pricePerHour: number;
  location: Location;
  images?: BikeImage[];
  reviews?: Review[];
}

export interface SearchBikesParams {
  brand?: string;
  year?: number;
  province?: string;
  ward?: string;
  minPrice?: number;
  maxPrice?: number;
  startTime?: string;
  endTime?: string;
  page?: number;
  size?: number;
  latitude?: number;
  longitude?: number;
  sortBy?: string;
}

export function parseImages(imagesJson: string): BikeImage[] {
  try {
    const imagesObj = JSON.parse(imagesJson || '{}');
    return Object.entries(imagesObj).map(
      ([id, url]) =>
        ({
          id,
          url,
        }) as BikeImage
    );
  } catch {
    return [];
  }
}

export async function searchBikes(
  params: SearchBikesParams,
  accessToken: string | null
): Promise<{
  bikes: Bike[];
  total: number;
}> {
  if (!accessToken) throw new Error('No access token');

  const queryParams = new URLSearchParams();

  if (params.brand) queryParams.append('brand', params.brand);
  if (params.year) queryParams.append('year', params.year.toString());
  if (params.province) queryParams.append('province', params.province);
  if (params.ward) queryParams.append('ward', params.ward);
  if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
  if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
  if (params.startTime) queryParams.append('startTime', params.startTime);
  if (params.endTime) queryParams.append('endTime', params.endTime);
  queryParams.append('page', (params.page || 1).toString());
  queryParams.append('size', (params.size || 10).toString());
  if (params.latitude) queryParams.append('latitude', params.latitude.toString());
  if (params.longitude) queryParams.append('longitude', params.longitude.toString());

  const response = await fetch(`${API_URL}/rention/cars?${queryParams.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const result = await response.json();

  if (!response.ok || result.status !== 200) {
    throw new Error(result.message[0]);
  }
  const total = result.pagination.totalElements;
  const bikes: Bike[] = result.data.map((bike: any) => ({
    ...bike,
    images: parseImages(bike.images),
  }));

  return {
    total,
    bikes,
  };
}

export const getPopularBikes = async (accessToken: string | null): Promise<{ bikes: Bike[] }> => {
  if (!accessToken) throw new Error('No access token');

  const { startTime, endTime } = getDefaultTimeRange();

  const queryParams = new URLSearchParams();

  queryParams.append('startTime', startTime);
  queryParams.append('endTime', endTime);

  const response = await fetch(`${API_URL}/rention/cars?${queryParams.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const result = await response.json();

  if (!response.ok || result.status !== 200) {
    throw new Error(result.message[0]);
  }

  const bikes: Bike[] = result.data.map((bike: any) => ({
    ...bike,
    images: parseImages(bike.images),
  }));

  return { bikes };
};

export const getBikeById = async (
  id: string | null,
  accessToken: string | null
): Promise<{ bikeDetail: BikeDetail }> => {
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_URL}/managemention-cars/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const result = await response.json();

  if (!response.ok || result.status !== 200) {
    throw new Error(result.message[0]);
  }

  const bikeDetail: BikeDetail = {
    ...result.data,
    images: parseImages(result.data.images),
  };

  return { bikeDetail };
};

export const createBike = async (car: BikeDetail, images: any[], accessToken: string | null) => {
  if (!accessToken) throw new Error('No access token');

  const formData = new FormData();

  formData.append('car', JSON.stringify(car));

  images.forEach((img) => {
    formData.append('images', {
      uri: img.uri,
      name: img.name,
      type: img.type,
    } as any);
  });

  const response = await fetch(generateAPIUrl('/api/bikes/create'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const result = await response.json();
  if (!response.ok || result.status !== 200) {
    throw new Error(result.message?.[0] || 'Upload failed');
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

export async function getListBikesOwner(
  params: SearchBikesParams,
  id: string,
  accessToken: string | null
): Promise<{ bikes: Bike[]; total: number }> {
  if (!accessToken) throw new Error('No access token');

  const queryParams = new URLSearchParams();

  if (params.brand) queryParams.append('brand', params.brand);
  if (params.year) queryParams.append('year', params.year.toString());
  if (params.province) queryParams.append('province', params.province);
  if (params.ward) queryParams.append('ward', params.ward);
  if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
  if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());

  const response = await fetch(
    `${API_URL}/managemention-cars/?page=1&size=1000&ownerId=${Number(id)}&${queryParams.toString()}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok || result.status !== 200) {
    throw new Error(result.message[0]);
  }

  const total = result.pagination.totalElements;
  const bikes: Bike[] = result.data.map((bike: any) => ({
    ...bike,
    images: parseImages(bike.images),
  }));

  return {
    total,
    bikes,
  };
}
