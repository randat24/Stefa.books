import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

// ============================================================================
// USER RENTALS API
// ============================================================================

/**
 * GET /api/user/rentals - Get user rentals
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'active'; // active, history, all

    let statusFilter: string[] = [];
    switch (type) {
      case 'active':
        statusFilter = ['active', 'overdue'];
        break;
      case 'history':
        statusFilter = ['returned', 'exchanged', 'cancelled'];
        break;
      case 'all':
        statusFilter = ['active', 'overdue', 'returned', 'exchanged', 'cancelled'];
        break;
    }

    // Get rentals with book details
    const { data: rentals, error: rentalsError } = await supabase
      .from('rentals')
      .select(`
        id,
        rental_date,
        due_date,
        return_date,
        status,
        notes,
        late_fee_uah,
        books!inner(
          id,
          title,
          author,
          cover_url,
          category,
          age_range
        )
      `)
      .eq('user_id', userId)
      .in('status', statusFilter)
      .order('rental_date', { ascending: false });

    if (rentalsError) {
      logger.error('User rentals: Error fetching rentals', rentalsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch rentals' },
        { status: 500 }
      );
    }

    // Format rentals data
    const formattedRentals = rentals?.map(rental => {
      const daysLeft = rental.due_date 
        ? Math.ceil((new Date(rental.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0;
      const isOverdue = daysLeft < 0 && rental.status === 'active';

      return {
        id: rental.id,
        book: {
          id: rental.books.id,
          title: rental.books.title,
          author: rental.books.author,
          cover_url: rental.books.cover_url,
          category: rental.books.category,
          age_range: rental.books.age_range
        },
        rental_date: rental.rental_date,
        due_date: rental.due_date,
        return_date: rental.return_date,
        status: rental.status,
        notes: rental.notes,
        late_fee: rental.late_fee_uah || 0,
        days_left: Math.max(0, daysLeft),
        is_overdue: isOverdue,
        can_exchange: rental.status === 'active' && !isOverdue,
        can_return: rental.status === 'active'
      };
    }) || [];

    logger.info('User rentals: Data fetched successfully', { userId, type, count: formattedRentals.length });

    return NextResponse.json({
      success: true,
      data: {
        rentals: formattedRentals,
        total: formattedRentals.length,
        type
      }
    });

  } catch (error) {
    logger.error('User rentals: Error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/rentals - Manage rental actions
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { action, rentalId, bookId, reason } = await request.json();

    switch (action) {
      case 'return':
        // Return a book
        if (!rentalId) {
          return NextResponse.json(
            { success: false, error: 'Rental ID is required' },
            { status: 400 }
          );
        }

        const { error: returnError } = await supabase
          .from('rentals')
          .update({
            status: 'returned',
            return_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', rentalId)
          .eq('user_id', userId);

        if (returnError) {
          logger.error('User rentals: Error returning book', returnError);
          return NextResponse.json(
            { success: false, error: 'Failed to return book' },
            { status: 500 }
          );
        }

        // Update book availability
        const { error: bookError } = await supabase
          .from('books')
          .update({ 
            status: 'available',
            available: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', bookId);

        if (bookError) {
          logger.error('User rentals: Error updating book status', bookError);
        }

        logger.info('User rentals: Book returned successfully', { userId, rentalId });

        return NextResponse.json({
          success: true,
          message: 'Книгу успішно повернено'
        });

      case 'exchange':
        // Exchange a book
        if (!rentalId || !bookId) {
          return NextResponse.json(
            { success: false, error: 'Rental ID and new book ID are required' },
            { status: 400 }
          );
        }

        // Check if user can exchange
        const { data: rentalData, error: rentalError } = await supabase
          .from('rentals')
          .select('*')
          .eq('id', rentalId)
          .eq('user_id', userId)
          .eq('status', 'active')
          .single();

        if (rentalError || !rentalData) {
          return NextResponse.json(
            { success: false, error: 'Rental not found or cannot be exchanged' },
            { status: 400 }
          );
        }

        // Check if new book is available
        const { data: newBookData, error: newBookError } = await supabase
          .from('books')
          .select('id, status, available')
          .eq('id', bookId)
          .single();

        if (newBookError || !newBookData || !newBookData.available) {
          return NextResponse.json(
            { success: false, error: 'New book is not available' },
            { status: 400 }
          );
        }

        // Update old rental
        const { error: updateOldError } = await supabase
          .from('rentals')
          .update({
            status: 'exchanged',
            return_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', rentalId);

        if (updateOldError) {
          logger.error('User rentals: Error updating old rental', updateOldError);
          return NextResponse.json(
            { success: false, error: 'Failed to exchange book' },
            { status: 500 }
          );
        }

        // Create new rental
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14); // 14 days rental period

        const { error: createNewError } = await supabase
          .from('rentals')
          .insert({
            user_id: userId,
            book_id: bookId,
            rental_date: new Date().toISOString(),
            due_date: dueDate.toISOString(),
            status: 'active',
            notes: `Обмін з книги ${rentalData.book_id}`
          });

        if (createNewError) {
          logger.error('User rentals: Error creating new rental', createNewError);
          return NextResponse.json(
            { success: false, error: 'Failed to create new rental' },
            { status: 500 }
          );
        }

        // Update book statuses
        await supabase
          .from('books')
          .update({ 
            status: 'available',
            available: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', rentalData.book_id);

        await supabase
          .from('books')
          .update({ 
            status: 'rented',
            available: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', bookId);

        logger.info('User rentals: Book exchanged successfully', { userId, rentalId, newBookId: bookId });

        return NextResponse.json({
          success: true,
          message: 'Книгу успішно обмінено'
        });

      case 'extend':
        // Extend rental period
        if (!rentalId) {
          return NextResponse.json(
            { success: false, error: 'Rental ID is required' },
            { status: 400 }
          );
        }

        const { data: extendRentalData, error: extendRentalError } = await supabase
          .from('rentals')
          .select('due_date')
          .eq('id', rentalId)
          .eq('user_id', userId)
          .eq('status', 'active')
          .single();

        if (extendRentalError || !extendRentalData) {
          return NextResponse.json(
            { success: false, error: 'Rental not found or cannot be extended' },
            { status: 400 }
          );
        }

        const newDueDate = new Date(extendRentalData.due_date);
        newDueDate.setDate(newDueDate.getDate() + 7); // Extend by 7 days

        const { error: extendError } = await supabase
          .from('rentals')
          .update({
            due_date: newDueDate.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', rentalId);

        if (extendError) {
          logger.error('User rentals: Error extending rental', extendError);
          return NextResponse.json(
            { success: false, error: 'Failed to extend rental' },
            { status: 500 }
          );
        }

        logger.info('User rentals: Rental extended successfully', { userId, rentalId });

        return NextResponse.json({
          success: true,
          message: 'Термін оренди продовжено на 7 днів'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('User rentals: Error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
