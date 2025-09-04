import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { emailService } from '@/lib/email';

interface RentalData {
  name: string;
  email: string;
  phone: string;
  social?: string;
  bookId?: string;
  plan: string;
  delivery: string;
  payment: string;
  note?: string;
  screenshot?: string;
  privacyConsent: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const data: RentalData = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'plan', 'delivery', 'payment', 'privacyConsent'];
    const missingFields = requiredFields.filter(field => !data[field as keyof RentalData]);
    
    if (missingFields.length > 0) {
      logger.warn('Rental form validation failed', { missingFields, data: { plan: data.plan, bookId: data.bookId } });
      return NextResponse.json(
        { error: 'Відсутні обов\'язкові поля', missingFields },
        { status: 400 }
      );
    }

    // Validate Ukrainian phone number
    const phoneRegex = /^\+380\d{9}$/;
    if (!phoneRegex.test(data.phone)) {
      logger.warn('Invalid phone number format in rental', { phone: data.phone });
      return NextResponse.json(
        { error: 'Неправильний формат телефону' },
        { status: 400 }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      logger.warn('Invalid email format in rental', { email: data.email });
      return NextResponse.json(
        { error: 'Неправильний формат електронної пошти' },
        { status: 400 }
      );
    }

    // Generate unique rental ID
    const rentalId = `rent_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    // Log successful rental submission
    logger.info('Rental form submitted successfully', {
      rentalId,
      bookId: data.bookId,
      plan: data.plan,
      paymentMethod: data.payment,
      deliveryMethod: data.delivery,
      hasScreenshot: !!data.screenshot,
      timestamp: new Date().toISOString()
    });

    // Send email notifications
    await emailService.sendRentalNotification({
      rentalId,
      customerData: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        bookId: data.bookId,
        plan: data.plan
      }
    });
    
    // Here you would typically:
    // 1. Save to database
    // 2. Check book availability
    // 3. Process payment if required
    
    return NextResponse.json({ 
      success: true, 
      rentalId,
      message: 'Заявку на оренду успішно надіслано! Ми зв\'яжемося з вами для підтвердження.'
    });

  } catch (error) {
    logger.error('Rental API error', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Rental API endpoint' },
    { status: 200 }
  );
}