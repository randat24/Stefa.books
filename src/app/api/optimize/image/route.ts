import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { logger } from '@/lib/logger';

// Настройка Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Предустановленные оптимизации
const OPTIMIZATION_PRESETS = {
  'web': {
    fetch_format: 'auto',
    quality: 'auto:good',
    flags: ['progressive', 'strip_profile'],
    color_space: 'srgb',
    dpr: 'auto'
  },
  'mobile': {
    fetch_format: 'auto',
    quality: 'auto:best',
    flags: ['progressive', 'strip_profile'],
    color_space: 'srgb',
    dpr: 'auto',
    responsive: true
  },
  'print': {
    fetch_format: 'auto',
    quality: 'auto:best',
    flags: ['strip_profile'],
    color_space: 'srgb',
    dpr: 'auto'
  },
  'social': {
    fetch_format: 'auto',
    quality: 'auto:good',
    flags: ['progressive', 'strip_profile'],
    color_space: 'srgb',
    dpr: 'auto',
    gravity: 'auto'
  }
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get('public_id');
    const width = searchParams.get('width');
    const height = searchParams.get('height');
    const crop = searchParams.get('crop') || 'limit';
    const quality = searchParams.get('quality') || 'auto:best';
    const format = searchParams.get('format') || 'auto';
    const preset = searchParams.get('preset');
    const gravity = searchParams.get('gravity');
    const radius = searchParams.get('radius');
    const border = searchParams.get('border');
    const overlay = searchParams.get('overlay');
    const effect = searchParams.get('effect');

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID не указан' },
        { status: 400 }
      );
    }

    // Базовые трансформации
    const transformations: any[] = [];

    // Применяем предустановку если указана
    if (preset && OPTIMIZATION_PRESETS[preset as keyof typeof OPTIMIZATION_PRESETS]) {
      transformations.push(OPTIMIZATION_PRESETS[preset as keyof typeof OPTIMIZATION_PRESETS]);
    }

    // Добавляем размеры
    if (width || height) {
      const sizeTransform: any = {};
      if (width) sizeTransform.width = parseInt(width);
      if (height) sizeTransform.height = parseInt(height);
      sizeTransform.crop = crop;
      transformations.push(sizeTransform);
    }

    // Добавляем качество и формат
    transformations.push({
      fetch_format: format,
      quality: quality
    });

    // Добавляем дополнительные параметры
    const additionalTransform: any = {};
    if (gravity) additionalTransform.gravity = gravity;
    if (radius) additionalTransform.radius = parseInt(radius);
    if (border) additionalTransform.border = border;
    if (overlay) additionalTransform.overlay = overlay;
    if (effect) additionalTransform.effect = effect;

    if (Object.keys(additionalTransform).length > 0) {
      transformations.push(additionalTransform);
    }

    // Генерируем оптимизированный URL
    const optimizedUrl = cloudinary.url(publicId, {
      transformation: transformations,
      secure: true
    });

    // Логируем оптимизацию
    logger.info('Image optimized', {
      public_id: publicId,
      transformations,
      optimized_url: optimizedUrl,
      preset,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      optimized_url: optimizedUrl,
      public_id: publicId,
      transformations,
      preset: preset || 'custom'
    });

  } catch (error) {
    console.error('Image optimization error:', error);
    logger.error('Image optimization failed', error);
    
    return NextResponse.json(
      { error: 'Ошибка оптимизации изображения' },
      { status: 500 }
    );
  }
}

// POST endpoint для создания оптимизированных версий
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { public_id, transformations, preset } = body;

    if (!public_id) {
      return NextResponse.json(
        { error: 'Public ID не указан' },
        { status: 400 }
      );
    }

    const finalTransformations: any[] = [];

    // Применяем предустановку если указана
    if (preset && OPTIMIZATION_PRESETS[preset as keyof typeof OPTIMIZATION_PRESETS]) {
      finalTransformations.push(OPTIMIZATION_PRESETS[preset as keyof typeof OPTIMIZATION_PRESETS]);
    }

    // Добавляем кастомные трансформации
    if (transformations && Array.isArray(transformations)) {
      finalTransformations.push(...transformations);
    }

    // Генерируем оптимизированный URL
    const optimizedUrl = cloudinary.url(public_id, {
      transformation: finalTransformations,
      secure: true
    });

    // Создаем производную версию (опционально)
    const derivedUrl = cloudinary.url(public_id, {
      transformation: finalTransformations,
      secure: true,
      version: Date.now() // Добавляем версию для кэширования
    });

    logger.info('Image optimization created', {
      public_id,
      transformations: finalTransformations,
      optimized_url: optimizedUrl,
      derived_url: derivedUrl,
      preset,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      optimized_url: optimizedUrl,
      derived_url: derivedUrl,
      public_id,
      transformations: finalTransformations,
      preset: preset || 'custom'
    });

  } catch (error) {
    console.error('Image optimization creation error:', error);
    logger.error('Image optimization creation failed', error);
    
    return NextResponse.json(
      { error: 'Ошибка создания оптимизированного изображения' },
      { status: 500 }
    );
  }
}
