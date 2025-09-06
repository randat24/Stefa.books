import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

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
      .from('book_rentals')
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
    logger.error('Unexpected error in rentals GET API:', { error });
    return NextResponse.json(
      { success: false, error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
