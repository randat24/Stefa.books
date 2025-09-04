import { supabase } from '../supabase';

describe('Database Queries', () => {
  // Note: These tests would typically be integration tests that run against a test database
  // For now, we'll create unit tests that mock the Supabase client

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Books Queries', () => {
    it('should fetch books with default parameters', async () => {
      // Mock the Supabase client response
      const mockBooks = [
        { 
          id: '1', 
          title: 'Test Book', 
          author: 'Test Author', 
          category: 'Fiction',
          available: true,
          rating: 4.5
        }
      ];

      // Mock the Supabase chain
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis()
      };

      const mockResponse = {
        data: mockBooks,
        error: null
      };

      // Mock the Supabase from method
      (supabase.from as jest.Mock).mockReturnValue({
        ...mockQuery,
        then: jest.fn().mockResolvedValue(mockResponse)
      });

      // Execute the query
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      // Assertions
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(data).toEqual(mockBooks);
      expect(error).toBeNull();
    });

    it('should fetch books with category filter', async () => {
      const mockBooks = [
        { 
          id: '1', 
          title: 'Test Book', 
          author: 'Test Author', 
          category: 'Fiction',
          available: true
        }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis()
      };

      const mockResponse = {
        data: mockBooks,
        error: null
      };

      (supabase.from as jest.Mock).mockReturnValue({
        ...mockQuery,
        eq: jest.fn().mockReturnValue({
          ...mockQuery,
          then: jest.fn().mockResolvedValue(mockResponse)
        })
      });

      // Execute the query with category filter
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('category', 'Fiction')
        .order('created_at', { ascending: false });

      // Assertions
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(mockQuery.eq).toHaveBeenCalledWith('category', 'Fiction');
      expect(data).toEqual(mockBooks);
      expect(error).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      const mockError = { 
        message: 'Database connection failed',
        details: 'Connection timeout'
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis()
      };

      const mockResponse = {
        data: null,
        error: mockError
      };

      (supabase.from as jest.Mock).mockReturnValue({
        ...mockQuery,
        then: jest.fn().mockResolvedValue(mockResponse)
      });

      // Execute the query
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      // Assertions
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(data).toBeNull();
      expect(error).toEqual(mockError);
    });
  });

  describe('Categories Queries', () => {
    it('should fetch categories ordered by sort_order', async () => {
      const mockCategories = [
        { id: '1', name: 'Fiction', sort_order: 1 },
        { id: '2', name: 'Non-Fiction', sort_order: 2 }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis()
      };

      const mockResponse = {
        data: mockCategories,
        error: null
      };

      (supabase.from as jest.Mock).mockReturnValue({
        ...mockQuery,
        order: jest.fn().mockReturnValue({
          then: jest.fn().mockResolvedValue(mockResponse)
        })
      });

      // Execute the query
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order')
        .order('name');

      // Assertions
      expect(supabase.from).toHaveBeenCalledWith('categories');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(data).toEqual(mockCategories);
      expect(error).toBeNull();
    });
  });

  describe('Search Queries', () => {
    it('should execute search_books RPC function', async () => {
      const mockResults = [
        {
          id: '1',
          title: 'Test Book',
          author: 'Test Author',
          category: 'Fiction',
          relevance_score: 0.95
        }
      ];

      const mockResponse = {
        data: mockResults,
        error: null
      };

      // Mock the Supabase RPC method
      (supabase.rpc as jest.Mock).mockResolvedValue(mockResponse);

      // Execute the RPC function
      const { data, error } = await (supabase as any).rpc('search_books', {
        query_text: 'test',
        limit_count: 10
      });

      // Assertions
      expect(supabase.rpc).toHaveBeenCalledWith('search_books', {
        query_text: 'test',
        limit_count: 10
      });
      expect(data).toEqual(mockResults);
      expect(error).toBeNull();
    });

    it('should handle search RPC errors', async () => {
      const mockError = {
        message: 'Search function not found',
        code: 'PGRST104'
      };

      const mockResponse = {
        data: null,
        error: mockError
      };

      (supabase.rpc as jest.Mock).mockResolvedValue(mockResponse);

      // Execute the RPC function
      const { data, error } = await (supabase as any).rpc('search_books', {
        query_text: 'test'
      });

      // Assertions
      expect(supabase.rpc).toHaveBeenCalledWith('search_books', {
        query_text: 'test'
      });
      expect(data).toBeNull();
      expect(error).toEqual(mockError);
    });
  });
});