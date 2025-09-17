import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { User, ActiveRental, RentalHistoryIcon, UserSubscription } from '@/types/user';

// ============================================================================
// USER DASHBOARD API
// ============================================================================

/**
 * GET /api/user/dashboard - Get user dashboard data
 */
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      logger.error('User dashboard: Error fetching user data', userError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    // Get active rentals
    const { data: activeRentals, error: rentalsError } = await supabase
      .from('rentals')
      .select(`
        id,
        rental_date,
        return_date,
        status,
        notes,
        books!inner(
          id,
          title,
          author,
          cover_url
        )
      `)
      .eq('user_id', userId)
      .in('status', ['active', 'overdue']);

    if (rentalsError) {
      logger.error('User dashboard: Error fetching active rentals', rentalsError);
    }

    // Get rental history (last 10)
    const { data: rentalHistoryIcon, error: historyError } = await supabase
      .from('rentals')
      .select(`
        id,
        rental_date,
        return_date,
        status,
        notes,
        books!inner(
          id,
          title,
          author,
          cover_url
        )
      `)
      .eq('user_id', userId)
      .in('status', ['returned', 'exchanged'])
      .order('rental_date', { ascending: false })
      .limit(10);

    if (historyError) {
      logger.error('User dashboard: Error fetching rental history', historyError);
    }

    // Calculate subscription info
    const subscription: UserSubscription | null = userData.subscription_type ? {
      plan: userData.subscription_type as any,
      status: getSubscriptionStatus(userData.subscription_start, userData.subscription_end),
      start_date: userData.subscription_start || '',
      end_date: userData.subscription_end || '',
      max_books: getMaxBooksForPlan(userData.subscription_type),
      rental_period_days: getRentalPeriodForPlan(userData.subscription_type),
      exchanges_per_month: getExchangesForPlan(userData.subscription_type),
      current_rentals: activeRentals?.length || 0,
      exchanges_used_this_month: 0, // TODO: Calculate from database
      total_books_rented: rentalHistoryIcon?.length || 0,
      total_amount_paid: 0, // TODO: Calculate from payments
      auto_renewal: true,
      next_billing_date: userData.subscription_end || undefined
    } : null;

    // Format active rentals
    const formattedActiveRentals: ActiveRental[] = (activeRentals || []).map((rental: any) => {
      const dueDate = rental.return_date ? new Date(rental.return_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 дней по умолчанию
      const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const isOverdue = daysLeft < 0;
      
      return {
        id: rental.id,
        user_id: userId,
        book_id: rental.books.id,
        book_title: rental.books.title,
        book_author: rental.books.author,
        book_cover_url: rental.books.cover_url || '/placeholder-book.jpg',
        rented_at: rental.rental_date,
        return_by: rental.return_date,
        exchange_count: 0, // TODO: Calculate from exchanges table
        max_exchanges: getExchangesForPlan(userData.subscription_type),
        status: rental.status as any,
        notes: rental.notes,
        days_left: Math.max(0, daysLeft),
        is_overdue: isOverdue,
        can_exchange: !isOverdue && (rental.status === 'active')
      };
    });

    // Format rental history
    const formattedRentalHistoryIcon: RentalHistoryIcon[] = (rentalHistoryIcon || []).map((rental: any) => {
      const totalDays = rental.return_date
        ? Math.ceil((new Date(rental.return_date).getTime() - new Date(rental.rental_date || new Date()).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        id: rental.id,
        user_id: userId,
        book_id: rental.books.id,
        book_title: rental.books.title,
        book_author: rental.books.author,
        book_cover_url: rental.books.cover_url || '/placeholder-book.jpg',
        rented_at: rental.rental_date,
        returned_at: rental.return_date,
        planned_return_date: rental.return_date,
        rating: 0, // TODO: Get from reviews table
        review: '', // TODO: Get from reviews table
        was_purchased: false, // TODO: Check purchases table
        total_days: totalDays,
        exchange_count: 0, // TODO: Calculate from exchanges table
        final_status: rental.status as any
      };
    });

    // Create user object
    const user: User = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      phone: userData.phone || undefined,
      status: userData.subscription_type ? 'subscriber' : 'registered',
      level: getUserLevel(0), // TODO: Add books_read_count field to users table
      subscription_plan: userData.subscription_type as any,
      subscription_status: subscription?.status,
      subscription_start_date: userData.subscription_start || undefined,
      subscription_end_date: userData.subscription_end || undefined,
      books_read_count: 0, // TODO: Add books_read_count field to users table
      total_rental_days: 0, // TODO: Add total_rental_days field to users table
      current_rentals_count: activeRentals?.length || 0,
      max_rentals_allowed: getMaxBooksForPlan(userData.subscription_type),
      reading_preferences: [], // TODO: Get from user preferences
      parental_controls: false, // TODO: Get from user settings
      notifications_enabled: true, // TODO: Get from user settings
      created_at: userData.created_at || '',
      updated_at: userData.updated_at || '',
      last_active_at: new Date().toISOString()
    };

    logger.info('User dashboard: Data fetched successfully', { userId });

    return NextResponse.json({
      success: true,
      data: {
        user,
        subscription,
        activeRentals: formattedActiveRentals,
        rentalHistoryIcon: formattedRentalHistoryIcon,
        stats: {
          totalBooksRead: 0, // TODO: Add books_read_count field to users table
          currentRentals: activeRentals?.length || 0,
          totalRentals: rentalHistoryIcon?.length || 0,
          daysActive: Math.ceil((Date.now() - new Date(userData.created_at || '').getTime()) / (1000 * 60 * 60 * 24))
        }
      }
    });

  } catch (error) {
    logger.error('User dashboard: Error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function getSubscriptionStatus(startDate: string | null, endDate: string | null): 'active' | 'expired' | 'cancelled' | 'paused' | 'pending' {
  if (!startDate || !endDate) return 'pending';
  
  const now = new Date();
  const end = new Date(endDate);
  
  if (now > end) return 'expired';
  return 'active';
}

function getMaxBooksForPlan(plan: string | null): number {
  switch (plan) {
    case 'mini': return 2;
    case 'maxi': return 5;
    case 'premium': return 10;
    case 'family': return 15;
    default: return 0;
  }
}

function getRentalPeriodForPlan(plan: string | null): number {
  switch (plan) {
    case 'mini': return 7;
    case 'maxi': return 14;
    case 'premium': return 21;
    case 'family': return 30;
    default: return 0;
  }
}

function getExchangesForPlan(plan: string | null): number {
  switch (plan) {
    case 'mini': return 1;
    case 'maxi': return 3;
    case 'premium': return 5;
    case 'family': return 10;
    default: return 0;
  }
}

function getUserLevel(booksReadCount: number): 'beginner' | 'reader' | 'booklover' | 'master' {
  if (booksReadCount < 6) return 'beginner';
  if (booksReadCount < 21) return 'reader';
  if (booksReadCount < 51) return 'booklover';
  return 'master';
}
