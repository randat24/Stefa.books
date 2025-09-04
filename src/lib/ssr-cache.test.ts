import { ssrCache } from './ssr-cache';

// Mock the API functions
jest.mock('./api/books', () => ({
  fetchBooks: jest.fn(),
  fetchCategories: jest.fn(),
  fetchBook: jest.fn(),
}));

// Mock the regular caches
jest.mock('./cache', () => ({
  booksCache: {
    get: jest.fn(),
    set: jest.fn(),
    createKey: jest.fn((prefix, filters) => {
      const sortedKeys = Object.keys(filters || {}).sort();
      return `${prefix}:${sortedKeys.map(key => `${key}=${filters[key]}`).join('&')}`;
    }),
  },
  categoriesCache: {
    get: jest.fn(),
    set: jest.fn(),
  },
  searchCache: {
    get: jest.fn(),
    set: jest.fn(),
    createKey: jest.fn((prefix, filters) => {
      const sortedKeys = Object.keys(filters || {}).sort();
      return `${prefix}:${sortedKeys.map(key => `${key}=${filters[key]}`).join('&')}`;
    }),
  },
}));

describe('SSRCacheService', () => {
  const { fetchBooks, fetchCategories, fetchBook } = jest.requireMock('./api/books');
  const { booksCache, categoriesCache, searchCache } = jest.requireMock('./cache');

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Clear SSR cache
    ssrCache.clearSSRCache();
  });

  describe('getBooks', () => {
    it('should return cached data from SSR cache if available', async () => {
      // Set up SSR cache with mock data
      const mockBooks = [{ id: '1', title: 'Test Book' }];
      (ssrCache as any).ssrCache.set('books_test', {
        data: mockBooks,
        timestamp: Date.now(),
        expiresAt: Date.now() + 10000,
      });

      const result = await ssrCache.getBooks({ limit: 10 }, 'books_test');
      
      expect(result).toEqual(mockBooks);
      expect(fetchBooks).not.toHaveBeenCalled();
    });

    it('should return cached data from regular cache if SSR cache miss', async () => {
      const mockResponse = {
        success: true,
        data: [{ id: '1', title: 'Test Book' }],
        count: 1,
      };

      // Mock regular cache hit
      (booksCache.get as jest.Mock).mockReturnValue(mockResponse);

      const result = await ssrCache.getBooks({ limit: 10 });
      
      expect(result).toEqual(mockResponse.data);
      expect(fetchBooks).not.toHaveBeenCalled();
      // Should also store in SSR cache
      const ssrCached = (ssrCache as any).ssrCache.get('books|limit_10');
      expect(ssrCached.data).toEqual(mockResponse.data);
    });

    it('should fetch from API if no cache available', async () => {
      const mockResponse = {
        success: true,
        data: [{ id: '1', title: 'Test Book' }],
        count: 1,
      };

      // Mock cache misses and API response
      (booksCache.get as jest.Mock).mockReturnValue(null);
      (fetchBooks as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ssrCache.getBooks({ limit: 10 });
      
      expect(result).toEqual(mockResponse.data);
      expect(fetchBooks).toHaveBeenCalledWith({ limit: 10 });
      // Should store in both caches
      expect(booksCache.set).toHaveBeenCalled();
      const ssrCached = (ssrCache as any).ssrCache.get('books|limit_10');
      expect(ssrCached.data).toEqual(mockResponse.data);
    });

    it('should return empty array on API error', async () => {
      // Mock cache misses and API error
      (booksCache.get as jest.Mock).mockReturnValue(null);
      (fetchBooks as jest.Mock).mockResolvedValue({
        success: false,
        error: 'API Error',
      });

      const result = await ssrCache.getBooks({ limit: 10 });
      
      expect(result).toEqual([]);
    });
  });

  describe('getCategories', () => {
    it('should return cached categories from SSR cache', async () => {
      // Set up SSR cache with mock data
      const mockCategories = ['Fiction', 'Non-Fiction'];
      (ssrCache as any).ssrCache.set('categories', {
        data: mockCategories,
        timestamp: Date.now(),
        expiresAt: Date.now() + 10000,
      });

      const result = await ssrCache.getCategories();
      
      expect(result).toEqual(mockCategories);
      expect(fetchCategories).not.toHaveBeenCalled();
    });

    it('should fetch categories from API and cache them', async () => {
      const mockResponse = {
        success: true,
        data: ['Fiction', 'Non-Fiction'],
        count: 2,
      };

      // Mock cache misses and API response
      (categoriesCache.get as jest.Mock).mockReturnValue(null);
      (fetchCategories as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ssrCache.getCategories();
      
      expect(result).toEqual(mockResponse.data);
      expect(fetchCategories).toHaveBeenCalled();
      // Should store in both caches
      expect(categoriesCache.set).toHaveBeenCalled();
      const ssrCached = (ssrCache as any).ssrCache.get('categories');
      expect(ssrCached.data).toEqual(mockResponse.data);
    });
  });

  describe('getBook', () => {
    it('should return cached book from SSR cache', async () => {
      const mockBook = { id: '1', title: 'Test Book' };
      (ssrCache as any).ssrCache.set('book_1', {
        data: mockBook,
        timestamp: Date.now(),
        expiresAt: Date.now() + 10000,
      });

      const result = await ssrCache.getBook('1');
      
      expect(result).toEqual(mockBook);
      expect(fetchBook).not.toHaveBeenCalled();
    });

    it('should fetch book from API and cache it', async () => {
      const mockResponse = {
        success: true,
        data: { id: '1', title: 'Test Book' },
      };

      // Mock cache misses and API response
      (booksCache.get as jest.Mock).mockReturnValue(null);
      (fetchBook as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ssrCache.getBook('1');
      
      expect(result).toEqual(mockResponse.data);
      expect(fetchBook).toHaveBeenCalledWith('1');
      // Should store in both caches
      expect(booksCache.set).toHaveBeenCalled();
      const ssrCached = (ssrCache as any).ssrCache.get('book_1');
      expect(ssrCached.data).toEqual(mockResponse.data);
    });
  });

  describe('getSearchResults', () => {
    it('should return cached search results from SSR cache', async () => {
      const mockBooks = [{ id: '1', title: 'Test Book' }];
      (ssrCache as any).ssrCache.set('search_test_20', {
        data: mockBooks,
        timestamp: Date.now(),
        expiresAt: Date.now() + 10000,
      });

      const result = await ssrCache.getSearchResults('test', 20);
      
      expect(result).toEqual(mockBooks);
      expect(fetchBooks).not.toHaveBeenCalled();
    });

    it('should fetch search results from API and cache them', async () => {
      const mockResponse = {
        success: true,
        data: [{ id: '1', title: 'Test Book' }],
        count: 1,
      };

      // Mock cache misses and API response
      (searchCache.get as jest.Mock).mockReturnValue(null);
      (fetchBooks as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ssrCache.getSearchResults('test', 20);
      
      expect(result).toEqual(mockResponse.data);
      expect(fetchBooks).toHaveBeenCalledWith({ search: 'test', limit: 20 });
      // Should store in both caches
      expect(searchCache.set).toHaveBeenCalled();
      const ssrCached = (ssrCache as any).ssrCache.get('search_test_20');
      expect(ssrCached.data).toEqual(mockResponse.data);
    });
  });

  describe('cache management', () => {
    it('should clear SSR cache', () => {
      // Add some data to SSR cache
      (ssrCache as any).ssrCache.set('test_key', {
        data: 'test_data',
        timestamp: Date.now(),
        expiresAt: Date.now() + 10000,
      });

      expect((ssrCache as any).ssrCache.size).toBe(1);
      
      ssrCache.clearSSRCache();
      
      expect((ssrCache as any).ssrCache.size).toBe(0);
    });

    it('should provide SSR cache statistics', () => {
      // Add some data to SSR cache
      (ssrCache as any).ssrCache.set('key1', {
        data: 'data1',
        timestamp: Date.now(),
        expiresAt: Date.now() + 10000,
      });
      (ssrCache as any).ssrCache.set('key2', {
        data: 'data2',
        timestamp: Date.now(),
        expiresAt: Date.now() + 10000,
      });

      const stats = ssrCache.getSSRStats();
      
      expect(stats.entryCount).toBe(2);
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
    });
  });
});