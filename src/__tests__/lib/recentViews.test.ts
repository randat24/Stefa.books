/**
 * @jest-environment jsdom
 */

import { 
  getRecentViews, 
  addToRecentViews, 
  clearRecentViews, 
  removeFromRecentViews,
  isInRecentViews 
} from '@/lib/recentViews';
import type { Book } from '@/lib/supabase';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn() };

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage });

const mockBook1: Book = {
  id: '1',
  code: 'TEST-001',
  title: 'Test Book 1',
  author: 'Test Author 1',
  category: 'Test Category',
  subcategory: null,
  description: null,
  short_description: 'Test description 1',
  isbn: null,
  pages: null,
  age_range: null,
  language: null,
  publisher: null,
  publication_year: null,
  cover_url: '/test1.jpg',
  status: 'available',
  available: true,
  qty_total: 1,
  qty_available: 1,
  price_uah: null,
  full_price_uah: null,
  location: null,
  rating: null,
  rating_count: null,
  badges: null,
  tags: null,
  search_vector: null,
  search_text: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString() };

const mockBook2: Book = {
  id: '2',
  code: 'TEST-002',
  title: 'Test Book 2',
  author: 'Test Author 2',
  category: 'Test Category',
  subcategory: null,
  description: null,
  short_description: 'Test description 2',
  isbn: null,
  pages: null,
  age_range: null,
  language: null,
  publisher: null,
  publication_year: null,
  cover_url: '/test2.jpg',
  status: 'available',
  available: true,
  qty_total: 1,
  qty_available: 1,
  price_uah: null,
  full_price_uah: null,
  location: null,
  rating: null,
  rating_count: null,
  badges: null,
  tags: null,
  search_vector: null,
  search_text: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString() };

describe('Recent Views', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('getRecentViews', () => {
    it('should return empty array when no data stored', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const result = getRecentViews();
      
      expect(result).toEqual([]);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('stefa-books-recent-views');
    });

    it('should return parsed array when valid data stored', () => {
      const mockData = [
        {
          id: '1',
          title: 'Test Book',
          author: 'Test Author',
          cover: '/test.jpg',
          viewedAt: '2023-01-01T00:00:00.000Z' }
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));
      
      const result = getRecentViews();
      
      expect(result).toEqual(mockData);
    });

    it('should return empty array when invalid JSON stored', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      
      const result = getRecentViews();
      
      expect(result).toEqual([]);
    });

    it('should return empty array when non-array data stored', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ not: 'array' }));
      
      const result = getRecentViews();
      
      expect(result).toEqual([]);
    });
  });

  describe('addToRecentViews', () => {
    beforeEach(() => {
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2023-01-01T00:00:00.000Z');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should add new book to empty list', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      addToRecentViews(mockBook1);
      
      const expectedRecentView = {
        id: '1',
        title: 'Test Book 1',
        author: 'Test Author 1',
        cover: '/test1.jpg',
        viewedAt: '2023-01-01T00:00:00.000Z' };

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'stefa-books-recent-views', 
        JSON.stringify([expectedRecentView])
      );
    });

    it('should add book to front of existing list', () => {
      const existingData = [
        {
          id: '2',
          title: 'Test Book 2',
          author: 'Test Author 2',
          cover: '/test2.jpg',
          viewedAt: '2023-01-01T00:00:00.000Z' }
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData));
      
      addToRecentViews(mockBook1);
      
      const expectedRecentView = {
        id: '1',
        title: 'Test Book 1',
        author: 'Test Author 1',
        cover: '/test1.jpg',
        viewedAt: '2023-01-01T00:00:00.000Z' };

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'stefa-books-recent-views', 
        JSON.stringify([expectedRecentView, ...existingData])
      );
    });

    it('should move existing book to front', () => {
      const existingData = [
        {
          id: '1',
          title: 'Test Book 1',
          author: 'Test Author 1',
          cover_url: '/test1.jpg',
          viewedAt: '2023-01-01T00:00:00.000Z' },
        {
          id: '2',
          title: 'Test Book 2',
          author: 'Test Author 2',
          cover_url: '/test2.jpg',
          viewedAt: '2023-01-01T00:00:00.000Z' }
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData));
      
      addToRecentViews(mockBook2);
      
      const updatedRecentView = {
        id: '2',
        title: 'Test Book 2',
        author: 'Test Author 2',
        cover: '/test2.jpg',
        viewedAt: '2023-01-01T00:00:00.000Z' };

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'stefa-books-recent-views', 
        JSON.stringify([updatedRecentView, existingData[0]])
      );
    });

    it('should limit to maximum 5 items', () => {
      const existingData = Array.from({ length: 5 }, (_, i) => ({
        id: `${i + 1}`,
        title: `Book ${i + 1}`,
        author: `Author ${i + 1}`,
        cover: `/book${i + 1}.jpg`,
        viewedAt: '2023-01-01T00:00:00.000Z' }));
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData));
      
      const newBook: Book = {
        id: 'new',
        title: 'New Book',
        author: 'New Author',
        category: 'Test Category',
        cover: '/new.jpg',
        short: 'New book',
        available: true };

      addToRecentViews(newBook);
      
      const newRecentView = {
        id: 'new',
        title: 'New Book',
        author: 'New Author',
        cover: '/new.jpg',
        viewedAt: '2023-01-01T00:00:00.000Z' };

      const expectedData = [newRecentView, ...existingData.slice(0, 4)];
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'stefa-books-recent-views', 
        JSON.stringify(expectedData)
      );
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      expect(() => addToRecentViews(mockBook1)).not.toThrow();
    });
  });

  describe('clearRecentViews', () => {
    it('should remove item from localStorage', () => {
      clearRecentViews();
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('stefa-books-recent-views');
    });

    it('should handle errors gracefully', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      expect(() => clearRecentViews()).not.toThrow();
    });
  });

  describe('removeFromRecentViews', () => {
    it('should remove specific book from list', () => {
      const existingData = [
        {
          id: '1',
          title: 'Book 1',
          author: 'Author 1',
          cover: '/book1.jpg',
          viewedAt: '2023-01-01T00:00:00.000Z' },
        {
          id: '2',
          title: 'Book 2',
          author: 'Author 2',
          cover: '/book2.jpg',
          viewedAt: '2023-01-01T00:00:00.000Z' }
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData));
      
      removeFromRecentViews('1');
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'stefa-books-recent-views', 
        JSON.stringify([existingData[1]])
      );
    });

    it('should handle removal of non-existent book', () => {
      const existingData = [
        {
          id: '1',
          title: 'Book 1',
          author: 'Author 1',
          cover: '/book1.jpg',
          viewedAt: '2023-01-01T00:00:00.000Z' }
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData));
      
      removeFromRecentViews('999');
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'stefa-books-recent-views', 
        JSON.stringify(existingData)
      );
    });

    it('should handle errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      expect(() => removeFromRecentViews('1')).not.toThrow();
    });
  });

  describe('isInRecentViews', () => {
    it('should return true if book is in recent views', () => {
      const existingData = [
        {
          id: '1',
          title: 'Book 1',
          author: 'Author 1',
          cover: '/book1.jpg',
          viewedAt: '2023-01-01T00:00:00.000Z' }
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData));
      
      expect(isInRecentViews('1')).toBe(true);
      expect(isInRecentViews('2')).toBe(false);
    });

    it('should return false when no recent views', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      expect(isInRecentViews('1')).toBe(false);
    });
  });
});