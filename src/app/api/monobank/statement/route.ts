import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { monobankService } from '@/lib/services/monobank';

// Схема для валідації параметрів
const statementSchema = z.object({
  account: z.string().min(1, 'ID рахунку обов\'язковий'),
  from: z.string().transform(val => parseInt(val, 10)),
  to: z.string().transform(val => parseInt(val, 10)).optional()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const account = searchParams.get('account');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!account || !from) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Параметри account та from обов\'язкові' 
        },
        { status: 400 }
      );
    }

    // Валідація параметрів
    const validatedData = statementSchema.parse({
      account,
      from,
      to: to || undefined
    });

    logger.info('Getting Monobank statement', {
      account: validatedData.account,
      from: validatedData.from,
      to: validatedData.to
    });

    const result = await monobankService.getStatement(
      validatedData.account, 
      validatedData.from,
      validatedData.to
    );

    if (result.status === 'error') {
      logger.error('Failed to get statement', { 
        error: result.errText,
        account: validatedData.account
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: result.errText || 'Помилка отримання виписки'
        },
        { status: 400 }
      );
    }

    logger.info('Statement retrieved successfully', {
      account: validatedData.account,
      transactionsCount: result.data?.length || 0
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: {
        account: validatedData.account,
        from: validatedData.from,
        to: validatedData.to,
        count: result.data?.length || 0
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Statement validation error', { errors: error.errors });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Невірні параметри',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    logger.error('Unexpected error in statement endpoint', error);
    return NextResponse.json(
      { success: false, error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

// OPTIONS для CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    }
  );
}