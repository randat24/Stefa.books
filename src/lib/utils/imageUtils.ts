/**
 * Утилиты для работы с изображениями
 */

/**
 * Конвертирует Google Drive ссылку в прямую ссылку для изображения
 * @param url - Google Drive ссылка
 * @returns Прямая ссылка на изображение или оригинальная ссылка
 */
export function convertGoogleDriveUrl(url: string | null): string {
  if (!url) return '/images/book-placeholder.svg';
  
  // Если это уже локальный путь, возвращаем как есть
  if (url.startsWith('/') || url.startsWith('http://localhost')) {
    return url;
  }
  
  // Если это Google Drive ссылка, конвертируем
  if (url.includes('drive.google.com/file/d/')) {
    const fileId = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    if (fileId) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  }
  
  // Если это Google Drive preview ссылка, конвертируем
  if (url.includes('lh3.googleusercontent.com')) {
    return url;
  }
  
  // Для других ссылок возвращаем как есть
  return url;
}

/**
 * Проверяет, является ли ссылка Google Drive ссылкой
 * @param url - URL для проверки
 * @returns true если это Google Drive ссылка
 */
export function isGoogleDriveUrl(url: string | null): boolean {
  if (!url) return false;
  return url.includes('drive.google.com/file/d/') || url.includes('lh3.googleusercontent.com');
}

/**
 * Получает placeholder изображение для книги
 * @returns Путь к placeholder изображению
 */
export function getBookPlaceholder(): string {
  return '/images/book-placeholder.svg';
}
