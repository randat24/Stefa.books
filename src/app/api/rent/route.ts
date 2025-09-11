import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

const rentalSchema = z.object({
  book_id: z.string().uuid(),
  plan: z.enum(['basic', 'extended', 'premium']),
  delivery_method: z.enum(['pickup', 'kyiv', 'ukraine']),
  customer_info: z.object({
    first_name: z.string().min(1, 'Ім\'я обов\'язкове'),
    last_name: z.string().min(1, 'Прізвище обов\'язкове'),
    email: z.string().email('Невірний email'),
    phone: z.string().min(10, 'Невірний номер телефону'),
    address: z.string().optional(),
    city: z.string().optional(),
    postal_code: z.string().optional(),
    notes: z.string().optional()
  }),
  payment_method: z.enum(['card', 'cash', 'bank']),
  total_price: z.number().positive('Ціна повинна бути позитивною')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    logger.info('Rental API: Request received', {
      body: body,
      bookId: body.book_id
    });
    
    // Validate input
    const validatedData = rentalSchema.parse(body);
    
    logger.info('Rental API: Data validated', {
      validatedData: validatedData
    });
    
    // Check if book exists and is available
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('id, title, is_active')
      .eq('id', validatedData.book_id)
      .single();

    logger.info('Rental API: Book lookup', {
      bookId: validatedData.book_id,
      bookError: bookError,
      book: book
    });

    if (bookError || !book) {
      logger.error('Rental API: Book not found', {
        bookId: validatedData.book_id,
        error: bookError
      });
      return NextResponse.json(
        { success: false, error: 'Книга не знайдена' },
        { status: 404 }
      );
    }

    if (!book.is_active) {
      return NextResponse.json(
        { success: false, error: 'Книга зараз недоступна для оренди' },
        { status: 400 }
      );
    }

    // Create rental record
    const { data: rental, error: rentalError } = await supabase
      .from('rentals')
      .insert({
        book_id: validatedData.book_id,
        user_id: '00000000-0000-0000-0000-000000000000', // Anonymous user UUID
        rental_date: new Date().toISOString(),
        return_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        status: 'active',
        notes: `Customer: ${validatedData.customer_info.first_name} ${validatedData.customer_info.last_name}, Email: ${validatedData.customer_info.email}, Phone: ${validatedData.customer_info.phone}, Plan: ${validatedData.plan}, Delivery: ${validatedData.delivery_method}, Payment: ${validatedData.payment_method}, Total: ${validatedData.total_price}₴${validatedData.customer_info.address ? `, Address: ${validatedData.customer_info.address}` : ''}${validatedData.customer_info.notes ? `, Notes: ${validatedData.customer_info.notes}` : ''}`
      })
      .select()
      .single();

    if (rentalError) {
      logger.error('Error creating rental:', { error: rentalError, data: validatedData });
      return NextResponse.json(
        { success: false, error: 'Помилка при створенні заявки на оренду' },
        { status: 500 }
      );
    }

    // Note: Book availability should be managed by admin
    // The rental is created successfully, admin will handle book status

    // Log successful rental
    logger.info('Rental created successfully:', {
      rental_id: rental.id,
      book_id: validatedData.book_id,
      customer_email: validatedData.customer_info.email,
      plan: validatedData.plan,
      total_price: validatedData.total_price
    });

    return NextResponse.json({
      success: true,
      rental_id: rental.id,
      message: 'Заявка на оренду успішно створена'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Невірні дані',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    logger.error('Unexpected error in rent API:', error);
    return NextResponse.json(
      { success: false, error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rentalId = searchParams.get('rental_id');
    
    if (!rentalId) {
      return NextResponse.json(
        { success: false, error: 'ID оренди обов\'язковий' },
        { status: 400 }
      );
    }

    // Get specific rental by ID
    const { data: rental, error: rentalError } = await supabase
      .from('rentals')
      .select('*')
      .eq('id', rentalId)
      .single();

    if (rentalError) {
      logger.error('Error fetching rental:', { error: rentalError, rentalId });
      return NextResponse.json(
        { success: false, error: 'Помилка при отриманні оренди' },
        { status: 500 }
      );
    }

    if (!rental) {
      return NextResponse.json(
        { success: false, error: 'Оренда не знайдена' },
        { status: 404 }
      );
    }

    // Get book details separately
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('id, title, author, cover_url')
      .eq('id', rental.book_id)
      .single();

    if (bookError) {
      logger.error('Error fetching book:', { error: bookError, bookId: rental.book_id });
      // Don't fail the request, just log the error
    }

    // Parse customer info from notes
    const notes = rental.notes || '';
    const customerMatch = notes.match(/Customer: ([^,]+), Email: ([^,]+), Phone: ([^,]+)/);
    const customerInfo = customerMatch ? {
      name: customerMatch[1],
      email: customerMatch[2],
      phone: customerMatch[3]
    } : {
      name: 'Unknown',
      email: 'unknown@example.com',
      phone: 'Unknown'
    };

    // Parse additional info from notes
    const planMatch = notes.match(/Plan: ([^,]+)/);
    const deliveryMatch = notes.match(/Delivery: ([^,]+)/);
    const paymentMatch = notes.match(/Payment: ([^,]+)/);
    const totalMatch = notes.match(/Total: ([^₴]+)₴/);
    const addressMatch = notes.match(/Address: ([^,]+)/);

    const rentalData = {
      ...rental,
      customer_name: customerInfo.name,
      customer_email: customerInfo.email,
      customer_phone: customerInfo.phone,
      customer_address: addressMatch ? addressMatch[1] : null,
      rental_plan: planMatch ? planMatch[1] : 'basic',
      delivery_method: deliveryMatch ? deliveryMatch[1] : 'pickup',
      payment_method: paymentMatch ? paymentMatch[1] : 'card',
      total_price: totalMatch ? parseInt(totalMatch[1]) : 0,
      book: book
    };

    return NextResponse.json({
      success: true,
      rental: rentalData
    });

  } catch (error) {
    logger.error('Unexpected error in rent GET API:', error);
    return NextResponse.json(
      { success: false, error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}