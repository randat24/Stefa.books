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
    
    // Validate input
    const validatedData = rentalSchema.parse(body);
    
    // Check if book exists and is available
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('id, title, available')
      .eq('id', validatedData.book_id)
      .single();

    if (bookError || !book) {
      return NextResponse.json(
        { success: false, error: 'Книга не знайдена' },
        { status: 404 }
      );
    }

    if (!book.available) {
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
        user_id: 'anonymous', // Will be updated when user auth is implemented
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        status: 'pending',
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

    // Mark book as unavailable
    const { error: updateError } = await supabase
      .from('books')
      .update({ available: false })
      .eq('id', validatedData.book_id);

    if (updateError) {
      logger.error('Error updating book availability:', { error: updateError });
      // Don't fail the request, just log the error
    }

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
    const customerEmail = searchParams.get('email');
    
    if (!customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Email обов\'язковий' },
        { status: 400 }
      );
    }

    // Get rentals for customer
    const { data: rentals, error } = await supabase
      .from('rentals')
      .select(`
        *,
        book:books(
          id,
          title,
          author,
          cover_url
        )
      `)
      .eq('customer_email', customerEmail)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching rentals:', { error, customerEmail });
      return NextResponse.json(
        { success: false, error: 'Помилка при отриманні оренд' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      rentals: rentals || []
    });

  } catch (error) {
    logger.error('Unexpected error in rent GET API:', error);
    return NextResponse.json(
      { success: false, error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}