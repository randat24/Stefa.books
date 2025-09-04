import { GET } from './route';

// Mock the data function
jest.mock('@/app/admin/data', () => ({
  getAnalyticsData: jest.fn().mockResolvedValue({
    totalBooks: 100,
    availableBooks: 80,
    issuedBooks: 20,
    totalUsers: 50,
    activeUsers: 45,
    totalRevenue: 5000,
    monthlyRevenue: 1000,
    popularBooks: [],
    userActivity: [],
    categoryStats: [],
  }),
}));

// Mock NextResponse
const mockJson = jest.fn();
jest.mock('next/server', () => ({
  NextResponse: {
    json: mockJson,
  },
}));

describe('Analytics API Route', () => {
  beforeEach(() => {
    mockJson.mockClear();
  });

  it('should return analytics data', async () => {
    await GET();
    
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      data: {
        totalBooks: 100,
        availableBooks: 80,
        issuedBooks: 20,
        totalUsers: 50,
        activeUsers: 45,
        totalRevenue: 5000,
        monthlyRevenue: 1000,
        popularBooks: [],
        userActivity: [],
        categoryStats: [],
      },
    });
  });
});