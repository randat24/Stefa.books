import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

const returnSchema = z.object({
  book_id: z.string().uuid(),
  return_method: z.enum(['pickup', 'courier']),
  book_condition: z.enum(['excellent', 'good', 'fair', 'damaged']),
  customer_info: z.object({
    first_name: z.string().min(1, 'Ім\'я обов\'язкове'),
    last_name: z.string().min(1, 'Прізвище обов\'язкове'),
    email: z.string().email('Невірний email'),
    phone: z.string().min(10, 'Невірний номер телефону'),
    address: z.string().optional(),
    city: z.string().optional(),
    postal_code: z.string().optional(),
    notes: z.string().optional()
  })
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = returnSchema.parse(body);
    
    // Check if book exists
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

    // Create return record
    const { data: returnRecord, error: returnError } = await supabase
      .from('book_returns')
      .insert({
        book_id: validatedData.book_id,
        user_id: 'anonymous', // Will be updated when user auth is implemented
        return_method: validatedData.return_method,
        book_condition: validatedData.book_condition,
        status: 'pending',
        notes: `Customer: ${validatedData.customer_info.first_name} ${validatedData.customer_info.last_name}, Email: ${validatedData.customer_info.email}, Phone: ${validatedData.customer_info.phone}, Method: ${validatedData.return_method}, Condition: ${validatedData.book_condition}${validatedData.customer_info.address ? `, Address: ${validatedData.customer_info.address}` : ''}${validatedData.customer_info.notes ? `, Notes: ${validatedData.customer_info.notes}` : ''}`,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (returnError) {
      logger.error('Error creating return record:', { error: returnError, data: validatedData });
      return NextResponse.json(
        { success: false, error: 'Помилка при створенні заявки на повернення' },
        { status: 500 }
      );
    }

    // Log successful return request
    logger.info('Return request created successfully:', {
      return_id: returnRecord.id,
      book_id: validatedData.book_id,
      customer_email: validatedData.customer_info.email,
      return_method: validatedData.return_method,
      book_condition: validatedData.book_condition
    });

    return NextResponse.json({
      success: true,
      return_id: returnRecord.id,
      message: 'Заявка на повернення успішно створена'
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

    logger.error('Unexpected error in return API:', { error });
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
    const returnId = searchParams.get('return_id');
    
    // If return_id is provided, get specific return
    if (returnId) {
      const { data: returnRecord, error } = await supabase
        .from('book_returns')
        .select(`
          *,
          book:books(
            id,
            title,
            author,
            cover_url
          )
        `)
        .eq('id', returnId)
        .single();

      if (error || !returnRecord) {
        return NextResponse.json(
          { success: false, error: 'Повернення не знайдено' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        return: returnRecord
      });
    }
    
    // If email is provided, get all returns for customer
    if (!customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Email або return_id обов\'язковий' },
        { status: 400 }
      );
    }

    // Get returns for customer
    const { data: returns, error } = await supabase
      .from('book_returns')
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
      logger.error('Error fetching returns:', { error, customerEmail });
      return NextResponse.json(
        { success: false, error: 'Помилка при отриманні повернень' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      returns: returns || []
    });

  } catch (error) {
    logger.error('Unexpected error in return GET API:', { error });
    return NextResponse.json(
      { success: false, error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
