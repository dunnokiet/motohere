import { getDefaultTimeRange, parseDateTime } from '@/lib/formatters';
import { create } from 'zustand';

export interface Location {
  id: string;
  province: string;
  latitude: number;
  longitude: number;
}

interface SearchStore {
  brand: string | null;
  location: Location | null;
  startTime: Date | null;
  endTime: Date | null;
  minPrice: number | null;
  maxPrice: number | null;
  year: number | null;

  setBrand: (brand: string | null) => void;
  setLocation: (location: Location | null) => void;
  setStartTime: (startTime: Date | null) => void;
  setEndTime: (endTime: Date | null) => void;
  setMinPrice: (minPrice: number | null) => void;
  setMaxPrice: (maxPrice: number | null) => void;
  setYear: (year: number | null) => void;
  setDefaultSearch: () => void;
}

export const useSearchStore = create<SearchStore>()((set, get) => ({
  brand: null,
  location: null,
  startTime: null,
  endTime: null,
  minPrice: null,
  maxPrice: null,
  year: null,

  setBrand: (brand) => set({ brand }),
  setLocation: (location) => set({ location }),
  setStartTime: (startTime) => set({ startTime }),
  setEndTime: (endTime) => set({ endTime }),
  setMinPrice: (minPrice) => set({ minPrice }),
  setMaxPrice: (maxPrice) => set({ maxPrice }),
  setYear: (year) => set({ year }),

  setDefaultSearch: () => {
    set({
      location: null,
      brand: null,
      startTime: null,
      endTime: null,
      minPrice: null,
      maxPrice: null,
      year: null,
    });

    const { location, startTime, endTime } = get();

    const updates: Partial<SearchStore> = {};

    if (!location) {
      updates.location = {
        id: '1',
        province: 'Thành phố Hồ Chí Minh',
        latitude: 10.8231,
        longitude: 106.6297,
      };
    }

    if (!startTime || !endTime) {
      const { startTime: defaultStart, endTime: defaultEnd } = getDefaultTimeRange();
      updates.startTime = parseDateTime(defaultStart);
      updates.endTime = parseDateTime(defaultEnd);
    }

    set(updates);
  },
}));
