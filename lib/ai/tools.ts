import * as BikesAPI from '@/api/bikes';
import { tool } from 'ai';
import { z } from 'zod';
import { getDefaultTimeRange } from '../formatters';

export const searchBikes = (accessToken: string) =>
  tool({
    description:
      'Tìm kiếm xe máy có sẵn theo địa điểm, hãng xe, giá và thời gian thuê. Trả về danh sách xe thực tế từ database với ảnh và thông tin chi tiết.',
    inputSchema: z.object({
      province: z.string().optional().describe('Tỉnh/Thành phố (VD: TP. HCM, TP. Hà Nội)'),
      ward: z.string().optional().describe('Quận/Huyện'),
      brand: z.string().optional().describe('Hãng xe (Honda, Yamaha, Suzuki, SYM)'),
      year: z.number().optional().describe('Năm sản xuất'),
      minPrice: z.number().optional().describe('Giá tối thiểu (VNĐ/giờ)'),
      maxPrice: z.number().optional().describe('Giá tối đa (VNĐ/giờ)'),
      startTime: z.string().optional().describe('Thời gian bắt đầu thuê (ISO)'),
      endTime: z.string().optional().describe('Thời gian trả xe (ISO)'),
      userLatitude: z.number().optional().describe('Vĩ độ vị trí người dùng'),
      userLongitude: z.number().optional().describe('Kinh độ vị trí người dùng'),
    }),
    execute: async (params) => {
      try {
        const timeRange =
          params.startTime && params.endTime
            ? { startTime: params.startTime, endTime: params.endTime }
            : getDefaultTimeRange();

        const result = await BikesAPI.searchBikes(
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
            searchParams: { province: params.province, brand: params.brand, ...timeRange },
          };
        }

        return {
          total: result.total,
          bikes: result.bikes,
          searchParams: { province: params.province, brand: params.brand, ...timeRange },
        };
      } catch (error: any) {
        return {
          message: error.message || 'Lỗi khi tìm kiếm xe. Vui lòng thử lại.',
          total: 0,
          bikes: [],
        };
      }
    },
  });
