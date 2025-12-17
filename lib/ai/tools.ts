import { searchBikes } from '@/api/bikes';
import { InferUITools, tool, ToolSet, UIDataTypes, UIMessage } from 'ai';
import { z } from 'zod';
import { getDefaultTimeRange } from '../formatters';

export function createToolSet(accessToken: string) {
  const tools = {
    searchMotorbikes: tool({
      description: 'Tìm xe máy theo vị trí, hãng xe, thời gian…',
      inputSchema: z.object({
        province: z.string().optional(),
        ward: z.string().optional(),
        brand: z.string().optional(),
        year: z.number().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        userLatitude: z.number().optional(),
        userLongitude: z.number().optional(),
      }),
      execute: async (params) => {
        const timeRange =
          params.startTime && params.endTime
            ? { startTime: params.startTime, endTime: params.endTime }
            : getDefaultTimeRange();

        const result = await searchBikes(
          {
            brand: params.brand,
            year: params.year,
            province: params.province,
            ward: params.ward,
            minPrice: params.minPrice,
            maxPrice: params.maxPrice,
            startTime: timeRange.startTime,
            endTime: timeRange.endTime,
            latitude: params.userLatitude,
            longitude: params.userLongitude,
            page: 1,
            size: 10,
          },
          accessToken
        );

        return { bikes: result.bikes };
      },
    }),
  } satisfies ToolSet;

  return tools;
}

export type MotoHereUITools = InferUITools<ReturnType<typeof createToolSet>>;
export type MotoHereUIMessage = UIMessage<never, UIDataTypes, MotoHereUITools>;
