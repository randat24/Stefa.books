"use client";

import { useEffect } from "react";
import { addToRecentViews } from "@/lib/recentViews";
import type { Book } from "@/lib/supabase";
import { logger } from "@/lib/logger";

interface BookViewTrackerProps {
  bookId: string;
  book?: Book;
}

export function BookViewTracker({ bookId, book }: BookViewTrackerProps) {
  useEffect(() => {
    if (!bookId) return;
    
    // If we have the full book object, use it for recent views
    if (book) {
      addToRecentViews(book);
    }
    
    // Track the book view regardless
    // In the future, this could also send analytics data
    logger.analytics(`Tracking view for book ${bookId}`);
  }, [bookId, book]);

  // This component doesn't render anything - it's a tracking utility
  return null;
}