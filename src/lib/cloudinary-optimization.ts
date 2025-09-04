/**
 * Утилиты для оптимизации изображений через Cloudinary
 * Основано на возможностях Cloudinary: https://console.cloudinary.com/app/c-5414e1e9bb66afef825efb62cf5c4d/image/optimize
 */

export interface CloudinaryOptimizationOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | 'best' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';
  crop?: 'fill' | 'fit' | 'scale' | 'crop';
  gravity?: 'auto' | 'face' | 'center';
  fetchFormat?: 'auto';
}

/**
 * Создает оптимизированный URL для Cloudinary изображения
 * @param originalUrl - Оригинальный URL изображения
 * @param options - Параметры оптимизации
 * @returns Оптимизированный URL
 */
export function getOptimizedCloudinaryUrl(
  originalUrl: string,
  options: CloudinaryOptimizationOptions = {}
): string {
  // Если это не Cloudinary URL, возвращаем оригинал
  if (!originalUrl.includes('res.cloudinary.com')) {
    return originalUrl;
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto'
    // fetchFormat = 'auto' // Will be used for format optimization
  } = options;

  // Парсим URL Cloudinary
  const urlParts = originalUrl.split('/');
  const uploadIndex = urlParts.findIndex(part => part === 'upload');
  
  if (uploadIndex === -1) return originalUrl;
  
  // Извлекаем части URL
  const baseUrl = urlParts.slice(0, uploadIndex + 1).join('/');
  const versionAndPath = urlParts.slice(uploadIndex + 1);
  
  // Находим версию (начинается с 'v')
  const versionIndex = versionAndPath.findIndex(part => part.startsWith('v'));
  if (versionIndex === -1) return originalUrl;
  
  const version = versionAndPath[versionIndex];
  const filePath = versionAndPath.slice(versionIndex + 1).join('/');

  // Строим параметры оптимизации
  const params: string[] = [];

  // Размеры
  if (width) params.push(`w_${width}`);
  if (height) params.push(`h_${height}`);
  if (width || height) {
    params.push(`c_${crop}`);
    if (gravity !== 'auto') params.push(`g_${gravity}`);
  }

  // Качество
  if (quality === 'auto') {
    params.push('q_auto');
  } else if (quality === 'best') {
    params.push('q_best');
  } else if (typeof quality === 'number') {
    params.push(`q_${quality}`);
  }

  // Формат
  if (format === 'auto') {
    params.push('f_auto');
  } else {
    params.push(`f_${format}`);
  }

  // Дополнительные оптимизации для веб-производительности
  params.push('fl_progressive'); // Прогрессивная загрузка для JPEG
  params.push('fl_immutable_cache'); // Кэширование

  // Собираем финальный URL: base/upload/params/version/path
  const optimizedParams = params.join(',');
  return `${baseUrl}/${optimizedParams}/${version}/${filePath}`;
}

/**
 * Предустановленные конфигурации для разных типов изображений
 */
export const CLOUDINARY_PRESETS = {
  // Для обложек книг в каталоге
  bookCover: {
    width: 300,
    height: 400,
    quality: 'auto' as const,
    format: 'auto' as const,
    crop: 'fill' as const,
    gravity: 'auto' as const
  },
  
  // Для обложек книг в детальном просмотре
  bookCoverLarge: {
    width: 500,
    height: 700,
    quality: 'auto' as const,
    format: 'auto' as const,
    crop: 'fill' as const,
    gravity: 'auto' as const
  },
  
  // Для миниатюр
  thumbnail: {
    width: 150,
    height: 200,
    quality: 'auto' as const,
    format: 'auto' as const,
    crop: 'fill' as const,
    gravity: 'auto' as const
  },
  
  // Для мобильных устройств
  mobile: {
    width: 250,
    height: 333,
    quality: 'auto' as const,
    format: 'auto' as const,
    crop: 'fill' as const,
    gravity: 'auto' as const
  }
} as const;

/**
 * Получает оптимизированный URL для обложки книги
 * @param coverUrl - URL обложки
 * @param preset - Предустановленная конфигурация
 * @returns Оптимизированный URL
 */
export function getOptimizedBookCover(
  coverUrl: string,
  preset: keyof typeof CLOUDINARY_PRESETS = 'bookCover'
): string {
  return getOptimizedCloudinaryUrl(coverUrl, CLOUDINARY_PRESETS[preset]);
}

/**
 * Получает несколько размеров изображения для responsive дизайна
 * @param coverUrl - URL обложки
 * @returns Объект с разными размерами
 */
export function getResponsiveBookCover(coverUrl: string) {
  return {
    thumbnail: getOptimizedBookCover(coverUrl, 'thumbnail'),
    mobile: getOptimizedBookCover(coverUrl, 'mobile'),
    desktop: getOptimizedBookCover(coverUrl, 'bookCover'),
    large: getOptimizedBookCover(coverUrl, 'bookCoverLarge')
  };
}
