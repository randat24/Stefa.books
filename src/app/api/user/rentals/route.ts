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
        return_date,
        status,
        notes,
        books!inner(
          id,
          title,
          author,
          cover_url,
          category_id,
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
    const formattedRentals = rentals?.map((rental: any) => {
      const dueDate = rental.return_date ? new Date(rental.return_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 дней по умолчанию
      const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const isOverdue = daysLeft < 0 && rental.status === 'active';

      return {
        id: rental.id,
        book: {
          id: rental.books.id,
          title: rental.books.title,
          author: rental.books.author,
          cover_url: rental.books.cover_url || '/placeholder-book.jpg',
          category: rental.books.category_id,
          age_range: rental.books.age_range || ''
        },
        rental_date: rental.rental_date,
        due_date: rental.return_date, // Используем return_date как due_date
        return_date: rental.return_date,
        status: rental.status,
        notes: rental.notes,
        late_fee: 0, // TODO: Add late_fee_uah field to rentals table
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
    const { action, rentalId, bookId } = await request.json();

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

        // Update book availability - increment quantity
        const { data: bookData } = await supabase
          .from('books')
          .select('qty_available')
          .eq('id', bookId)
          .single();
        
        const newQuantity = (bookData?.qty_available || 0) + 1;
        
        const { error: bookError } = await supabase
          .from('books')
          .update({ 
            status: 'available',
            qty_available: newQuantity,
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
          .select('id, status, qty_available, is_active')
          .eq('id', bookId)
          .single();

        if (newBookError || !newBookData || (newBookData.qty_available || 0) <= 0 || !newBookData.is_active) {
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
            return_date: dueDate.toISOString(),
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

        // Update book statuses - increment old book quantity
        const { data: oldBookData } = await supabase
          .from('books')
          .select('qty_available')
          .eq('id', rentalData.book_id)
          .single();
        
        const oldBookNewQuantity = (oldBookData?.qty_available || 0) + 1;
        
        await supabase
          .from('books')
          .update({ 
            status: 'available',
            qty_available: oldBookNewQuantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', rentalData.book_id);

        // Decrement new book quantity
        const { data: newBookDataForExchange } = await supabase
          .from('books')
          .select('qty_available')
          .eq('id', bookId)
          .single();
        
        const newBookNewQuantity = Math.max(0, (newBookDataForExchange?.qty_available || 1) - 1);
        
        await supabase
          .from('books')
          .update({ 
            status: 'rented',
            qty_available: newBookNewQuantity,
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
          .select('return_date')
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

        const newDueDate = new Date((extendRentalData as any).return_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
        newDueDate.setDate(newDueDate.getDate() + 7); // Extend by 7 days

        const { error: extendError } = await supabase
          .from('rentals')
          .update({
            return_date: newDueDate.toISOString(),
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
