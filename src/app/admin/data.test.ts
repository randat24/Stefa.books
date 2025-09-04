// import { getDashboardStats } from './data';

// Mock the Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    then: jest.fn().mockResolvedValue({ data: [], error: null }),
  },
}));

describe('Admin Data Functions', () => {
  describe('getAnalyticsData', () => {
    it('should return analytics data with default values when no data is available', async () => {
      const result = await getAnalyticsData();
      
      expect(result).toEqual({
        totalBooks: 0,
        availableBooks: 0,
        issuedBooks: 0,
        totalUsers: 0,
        activeUsers: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        popularBooks: [],
        userActivity: [],
        categoryStats: [],
      });
    });
  });
});