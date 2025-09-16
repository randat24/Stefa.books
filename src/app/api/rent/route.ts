import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { createSupabaseServerClient } from '@/lib/supabase/server';
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

    // Проверяем аутентификацию пользователя
    const supabaseServer = await createSupabaseServerClient();
    const { data: { user: authUser }, error: authError } = await supabaseServer.auth.getUser();

    let userId = '00000000-0000-0000-0000-000000000000'; // Anonymous user по умолчанию
    let maxRentals = 0; // Неавторизованные пользователи не могут брать в аренду

    if (authUser) {
      // Проверяем подписку пользователя
      const userSubscription = await checkUserSubscription(authUser.id);
      if (userSubscription.isActive) {
        userId = authUser.id;
        maxRentals = userSubscription.maxRentals;

        // Проверяем текущие активные аренды
        const activeRentals = await countActiveRentals(authUser.id);
        if (activeRentals >= maxRentals) {
          return NextResponse.json(
            {
              success: false,
              error: `Ви вже маєте максимальну кількість активних орендованих книг (${maxRentals}). Поверніть одну з книг, щоб орендувати нову.`
            },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'У вас немає активної підписки. Будь ласка, оформіть підписку для оренди книг.'
          },
          { status: 403 }
        );
      }
    } else {
      // Неавторизованный пользователь - создаем анонимную заявку
      logger.info('Anonymous rental request', { bookId: validatedData.book_id });
    }
    
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
    const rentalData = {
      book_id: validatedData.book_id,
      user_id: userId,
      rental_date: new Date().toISOString(),
      return_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      status: authUser ? 'active' : 'pending', // Авторизованные пользователи получают активную аренду сразу
      notes: `Customer: ${validatedData.customer_info.first_name} ${validatedData.customer_info.last_name}, Email: ${validatedData.customer_info.email}, Phone: ${validatedData.customer_info.phone}, Plan: ${validatedData.plan}, Delivery: ${validatedData.delivery_method}, Payment: ${validatedData.payment_method}, Total: ${validatedData.total_price}₴${validatedData.customer_info.address ? `, Address: ${validatedData.customer_info.address}` : ''}${validatedData.customer_info.notes ? `, Notes: ${validatedData.customer_info.notes}` : ''}`
    };

    const { data: rental, error: rentalError } = await supabase
      .from('rentals')
      .insert(rentalData)
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

/**
 * Проверяет подписку пользователя и возвращает информацию о лимитах
 */
async function checkUserSubscription(authUserId: string): Promise<{
  isActive: boolean;
  subscriptionType: string | null;
  maxRentals: number;
}> {
  try {
    // Ищем пользователя по auth_id
    const { data: user, error } = await supabase
      .from('users')
      .select('subscription_type, status, subscription_status')
      .eq('auth_id', authUserId)
      .single();

    if (error || !user) {
      logger.warn('User not found in users table', { authUserId, error });
      return { isActive: false, subscriptionType: null, maxRentals: 0 };
    }

    const isActive =
      user.status === 'active' &&
      user.subscription_status === 'active' &&
      ['mini', 'maxi'].includes(user.subscription_type);

    const maxRentals = user.subscription_type === 'mini' ? 1 :
                      user.subscription_type === 'maxi' ? 2 : 0;

    return {
      isActive,
      subscriptionType: user.subscription_type,
      maxRentals
    };
  } catch (error) {
    logger.error('Error checking user subscription', { authUserId, error });
    return { isActive: false, subscriptionType: null, maxRentals: 0 };
  }
}

/**
 * Подсчитывает количество активных аренд пользователя
 */
async function countActiveRentals(authUserId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('rentals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authUserId)
      .eq('status', 'active');

    if (error) {
      logger.error('Error counting active rentals', { authUserId, error });
      return 999; // В случае ошибки возвращаем большое число для блокировки
    }

    return count || 0;
  } catch (error) {
    logger.error('Error counting active rentals', { authUserId, error });
    return 999;
  }
}