import { CacheInvalidationService } from './cache-invalidation';

// Mock the CDN invalidation function
jest.mock('./cdn/cache-invalidation', () => ({
  invalidateContentCache: jest.fn().mockResolvedValue({ success: true })
}));

describe('CacheInvalidationService', () => {
  let service: CacheInvalidationService;

  beforeEach(() => {
    service = new CacheInvalidationService();
  });

  describe('invalidateBooksCache', () => {
    it('should invalidate all books cache when no bookId is provided', async () => {
      const result = await service.invalidateBooksCache();
      expect(result.success).toBe(true);
    });

    it('should invalidate specific book cache when bookId is provided', async () => {
      const result = await service.invalidateBooksCache('book-123');
      expect(result.success).toBe(true);
    });
  });

  describe('invalidateCategoriesCache', () => {
    it('should invalidate categories cache', async () => {
      const result = await service.invalidateCategoriesCache();
      expect(result.success).toBe(true);
    });
  });

  describe('invalidateUserCache', () => {
    it('should invalidate user cache', async () => {
      const result = await service.invalidateUserCache('user-123');
      expect(result.success).toBe(true);
    });
  });

  describe('invalidateAllCache', () => {
    it('should invalidate all caches', async () => {
      const result = await service.invalidateAllCache();
      expect(result.success).toBe(true);
    });
  });
});