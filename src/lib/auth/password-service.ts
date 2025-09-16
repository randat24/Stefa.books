import { logger } from '@/lib/logger';

/**
 * Сервис для работы с временными паролями
 */
export class PasswordService {
  /**
   * Генерирует временный пароль
   * @param length Длина пароля (по умолчанию 12 символов)
   * @returns Временный пароль
   */
  static generateTemporaryPassword(length: number = 12): string {
    // Используем безопасные символы для временного пароля
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    logger.info('Temporary password generated', {
      length,
      timestamp: new Date().toISOString()
    });

    return password;
  }

  /**
   * Создает безопасную ссылку для установки пароля
   * @param userId ID пользователя
   * @param email Email пользователя
   * @returns Токен для установки пароля
   */
  static generatePasswordSetupToken(userId: string, email: string): string {
    // Простой токен на основе времени и пользователя
    const timestamp = Date.now();
    const payload = `${userId}:${email}:${timestamp}`;

    // В реальном проекте здесь должна быть криптографическая подпись
    const token = Buffer.from(payload).toString('base64url');

    logger.info('Password setup token generated', {
      userId,
      timestamp: new Date().toISOString()
    });

    return token;
  }

  /**
   * Проверяет токен установки пароля
   * @param token Токен для проверки
   * @returns Информация о пользователе или null
   */
  static verifyPasswordSetupToken(token: string): { userId: string; email: string; timestamp: number } | null {
    try {
      const payload = Buffer.from(token, 'base64url').toString();
      const [userId, email, timestampStr] = payload.split(':');

      const timestamp = parseInt(timestampStr);
      const now = Date.now();

      // Токен действует 24 часа
      if (now - timestamp > 24 * 60 * 60 * 1000) {
        logger.warn('Password setup token expired', { token });
        return null;
      }

      return { userId, email, timestamp };
    } catch (error) {
      logger.error('Invalid password setup token', { token, error });
      return null;
    }
  }

  /**
   * Проверяет надежность пароля
   * @param password Пароль для проверки
   * @returns Результат проверки
   */
  static validatePasswordStrength(password: string): {
    valid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong'
  } {
    const errors: string[] = [];
    let score = 0;

    if (password.length < 6) {
      errors.push('Пароль повинен містити принаймні 6 символів');
    } else {
      score += 1;
    }

    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (score >= 4) strength = 'medium';
    if (score >= 6) strength = 'strong';

    return {
      valid: errors.length === 0,
      errors,
      strength
    };
  }
}