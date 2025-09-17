/**
 * Recent Views utility for managing recently viewed books
 */

import type { Book } from '@/lib/supabase';

const RECENT_VIEWS_KEY = 'stefa-books-recent-views';
const MAX_RECENT_VIEWS = 5;

export interface RecentView {
  id: string;
  title: string;
  author: string;
  cover: string;
  viewedAt: string;
}

/**
 * Add a book to recent views
 */
export function addToRecentViews(book: Book): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = getRecentViews();
    
    // Remove if already exists
    const filtered = existing.filter(item => item.id !== book.id);
    
    // Add to beginning
    const newRecentView: RecentView = {
      id: book.id,
      title: book.title,
      author: book.author,
      cover: book.cover_url || '/images/book-placeholder.svg',
      viewedAt: new Date().toISOString() };
    
    const updated = [newRecentView, ...filtered].slice(0, MAX_RECENT_VIEWS);
    
    localStorage.setItem(RECENT_VIEWS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to add to recent views:', error);
  }
}

/**
 * Get all recent views
 */
export function getRecentViews(): RecentView[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(RECENT_VIEWS_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to get recent views:', error);
    return [];
  }
}

/**
 * Clear all recent views
 */
export function clearRecentViews(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(RECENT_VIEWS_KEY);
  } catch (error) {
    console.warn('Failed to clear recent views:', error);
  }
}

/**
 * Remove a specific book from recent views
 */
export function removeFromRecentViews(bookId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = getRecentViews();
    const filtered = existing.filter(item => item.id !== bookId);
    localStorage.setItem(RECENT_VIEWS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.warn('Failed to remove from recent views:', error);
  }
}

/**
 * Check if a book is in recent views
 */
export function isInRecentViews(bookId: string): boolean {
  const recentViews = getRecentViews();
  return recentViews.some(item => item.id === bookId);
}