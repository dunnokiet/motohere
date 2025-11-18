import { Bike, searchBikes } from '@/api/bikes';
import { MOTOHERE_SYSTEM_PROMPT } from '@/lib/ai/prompt';
import { formatPrice, getDefaultTimeRange } from '@/lib/formatters';
import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, stepCountIs, streamText, tool, UIMessage } from 'ai';
import z from 'zod';

export async function POST(req: Request) {
  const { messages, accessToken }: { messages: UIMessage[]; accessToken: string } =
    await req.json();

  const result = streamText({
    system: MOTOHERE_SYSTEM_PROMPT,
    model: openai('gpt-4o-mini'),
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    temperature: 0.7,
    maxOutputTokens: 500,

    tools: {
      searchMotorbikes: tool({
        description:
          'Tìm kiếm xe máy có sẵn theo địa điểm, hãng xe, giá và thời gian thuê. Trả về danh sách xe thực tế từ database với ảnh và thông tin chi tiết.',
        inputSchema: z.object({
          province: z
            .string()
            .optional()
            .describe('Tỉnh/Thành phố (VD: Thành phố Hồ Chí Minh, Thành phố Hà Nội)'),
          ward: z.string().optional().describe('Quận/Huyện'),
          brand: z.string().optional().describe('Hãng xe (Honda, Yamaha, Suzuki, SYM)'),
          year: z.number().optional().describe('Năm sản xuất'),
          minPrice: z.number().optional().describe('Giá tối thiểu (VNĐ/giờ)'),
          maxPrice: z.number().optional().describe('Giá tối đa (VNĐ/giờ)'),
          startTime: z
            .string()
            .optional()
            .describe(
              'Thời gian bắt đầu thuê (ISO: 2025-10-16T08:30:00). Nếu không có, dùng thời gian mặc định'
            ),
          endTime: z
            .string()
            .optional()
            .describe(
              'Thời gian trả xe (ISO: 2025-10-16T12:00:00). Nếu không có, dùng thời gian mặc định'
            ),
          userLatitude: z.number().optional().describe('Vĩ độ vị trí người dùng'),
          userLongitude: z.number().optional().describe('Kinh độ vị trí người dùng'),
        }),
        execute: async (params) => {
          try {
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

            if (!result.bikes || result.bikes.length === 0) {
              return {
                success: false,
                message: 'Không tìm thấy xe phù hợp với yêu cầu',
                total: 0,
                bikes: [],
                searchParams: {
                  province: params.province,
                  brand: params.brand,
                  ...timeRange,
                },
              };
            }

            const bikes = result.bikes.map((bike: Bike) => ({
              id: bike.id,
              brand: bike.brand,
              model: bike.model,
              name: `${bike.brand} ${bike.model}`,
              year: bike.year,
              pricePerHour: bike.pricePerHour,
              pricePerDay: bike.pricePerHour * 24,
              pricePerHourFormatted: formatPrice(bike.pricePerHour),
              pricePerDayFormatted: formatPrice(bike.pricePerHour * 24),
              // images: bike.images,
              // firstImage: bike.images[0]?.url,
              distance: bike.distance,
              location: bike.locationName,
              province: bike.province,
              ward: bike.ward,
              // coordinates: {
              //   lat: bike.latitude,
              //   lng: bike.longitude,
              // },
            }));

            return {
              total: result.total,
              bikes,
              searchParams: {
                province: params.province,
                brand: params.brand,
                ...timeRange,
              },
            };
          } catch (error: any) {
            return {
              message: error.message || 'Lỗi khi tìm kiếm xe. Vui lòng thử lại.',
              total: 0,
              bikes: [],
            };
          }
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse({
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'none',
    },
  });
}
