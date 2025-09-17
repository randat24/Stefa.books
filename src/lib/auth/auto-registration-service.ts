import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { PasswordService } from './password-service';
import { EmailService } from '@/lib/services/email-service';
// Removed User import as it's not available in current Supabase version

export interface AutoRegistrationData {
  email: string;
  name: string;
  phone?: string;
  plan: 'mini' | 'maxi';
  paymentMethod: string;
  subscriptionRequestId: number | string;
}

export interface AutoRegistrationResult {
  success: boolean;
  user?: any;
  temporaryPassword?: string;
  setupToken?: string;
  error?: string;
}

/**
 * Сервис для автоматической регистрации пользователей после оплаты
 */
export class AutoRegistrationService {
  /**
   * Регистрирует пользователя автоматически с временным паролем
   */
  static async registerWithTemporaryPassword(data: AutoRegistrationData): Promise<AutoRegistrationResult> {
    try {
      logger.info('AutoRegistration: Starting registration with temporary password', {
        email: data.email,
        plan: data.plan,
        subscriptionRequestId: data.subscriptionRequestId
      });

      // Проверяем, существует ли пользователь
      const existingUser = await this.checkExistingUser(data.email);
      if (existingUser.exists) {
        return {
          success: false,
          error: 'Користувач з таким email вже існує'
        };
      }

      // Генерируем временный пароль
      const temporaryPassword = PasswordService.generateTemporaryPassword(10);

      // Создаем пользователя в Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: temporaryPassword,
        options: {
          data: {
            name: data.name,
            phone: data.phone || null,
            subscription_plan: data.plan,
            is_auto_registered: true,
            subscription_request_id: data.subscriptionRequestId
          }
        }
      });

      if (authError) {
        logger.error('AutoRegistration: Auth creation failed', {
          error: authError.message,
          email: data.email
        });
        return {
          success: false,
          error: authError.message
        };
      }

      // Создаем профиль пользователя в таблице users
      if (authData.user) {
        // Находим максимальный ID для новой записи (таблица users использует числовые ID)
        const { data: maxIdData } = await supabase
          .from('users')
          .select('id')
          .order('id', { ascending: false })
          .limit(1);

        const nextId = maxIdData && maxIdData.length > 0 ? maxIdData[0].id + 1 : 1;

        const userProfileData = {
          id: nextId,
          email: data.email,
          name: data.name,
          phone: data.phone || null,
          role: 'user',
          subscription_type: data.plan,
          status: 'active'
        };

        logger.info('Creating user profile', {
          userId: authData.user.id,
          nextId: nextId,
          email: data.email,
          profileData: userProfileData
        });

        const { error: profileError } = await supabase
          .from('users')
          .insert(userProfileData);

        if (profileError) {
          logger.error('AutoRegistration: Profile creation failed', {
            error: profileError.message,
            userId: authData.user.id
          });
          // Не останавливаем процесс, профиль можно создать позже
        }

        // Обновляем заявку на подписку со статусом "обработана" и связываем с пользователем
        const { error: updateError } = await supabase
          .from('subscription_requests')
          .update({
            user_id: nextId, // Используем числовой ID из таблицы users
            status: 'completed',
            admin_notes: `Користувач автоматично зареєстрований (ID: ${nextId}). Тимчасовий пароль надіслано на email.`,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.subscriptionRequestId);

        if (updateError) {
          logger.error('AutoRegistration: Failed to update subscription request', {
            error: updateError.message,
            subscriptionRequestId: data.subscriptionRequestId
          });
        }

        // Отправляем email с временным паролем
        const emailSent = await EmailService.sendTemporaryPassword(
          data.email,
          data.name,
          temporaryPassword
        );

        if (!emailSent) {
          logger.warn('AutoRegistration: Failed to send temporary password email', {
            email: data.email,
            userId: authData.user.id
          });
        }

        logger.info('AutoRegistration: User registered successfully', {
          userId: authData.user.id,
          email: data.email,
          plan: data.plan,
          emailSent
        });

        return {
          success: true,
          user: authData.user,
          temporaryPassword: temporaryPassword
        };
      }

      return {
        success: false,
        error: 'Не вдалося створити користувача'
      };

    } catch (error) {
      logger.error('AutoRegistration: Registration error', {
        error: error instanceof Error ? error.message : String(error),
        email: data.email
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Невідома помилка'
      };
    }
  }

  /**
   * Регистрирует пользователя с токеном для установки пароля
   */
  static async registerWithPasswordSetup(data: AutoRegistrationData): Promise<AutoRegistrationResult> {
    try {
      logger.info('AutoRegistration: Starting registration with password setup', {
        email: data.email,
        plan: data.plan
      });

      // Проверяем, существует ли пользователь
      const existingUser = await this.checkExistingUser(data.email);
      if (existingUser.exists) {
        return {
          success: false,
          error: 'Користувач з таким email вже існує'
        };
      }

      // Генерируем токен для установки пароля
      const setupToken = PasswordService.generatePasswordSetupToken(data.email, data.email);

      // Создаем временную запись в базе данных для токена
      // В реальном проекте лучше создать отдельную таблицу password_setup_tokens
      const { error: tokenError } = await supabase
        .from('user_profiles')
        .insert({
          email: data.email,
          name: data.name,
          phone: data.phone || null,
          subscription_type: data.plan,
          status: 'pending_password_setup',
          notes: `Очікує встановлення паролю. Токен: ${setupToken}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (tokenError) {
        logger.error('AutoRegistration: Token record creation failed', {
          error: tokenError.message,
          email: data.email
        });
        return {
          success: false,
          error: tokenError.message
        };
      }

      // Отправляем email со ссылкой для установки пароля
      const emailSent = await EmailService.sendPasswordSetupLink(
        data.email,
        data.name,
        setupToken
      );

      if (!emailSent) {
        logger.warn('AutoRegistration: Failed to send password setup email', {
          email: data.email
        });
      }

      logger.info('AutoRegistration: Password setup initiated', {
        email: data.email,
        emailSent
      });

      return {
        success: true,
        setupToken
      };

    } catch (error) {
      logger.error('AutoRegistration: Password setup error', {
        error: error instanceof Error ? error.message : String(error),
        email: data.email
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Невідома помилка'
      };
    }
  }

  /**
   * Проверяет, существует ли пользователь с данным email
   */
  private static async checkExistingUser(email: string): Promise<{ exists: boolean; userId?: string }> {
    try {
      // Проверяем в Supabase Auth
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const existingAuthUser = authUsers?.users?.find(user => user.email === email);

      if (existingAuthUser) {
        return { exists: true, userId: existingAuthUser.id };
      }

      // Проверяем в таблице users
      const { data: dbUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (dbUser) {
        return { exists: true, userId: dbUser.id };
      }

      return { exists: false };

    } catch (error) {
      logger.error('AutoRegistration: Error checking existing user', {
        email,
        error: error instanceof Error ? error.message : String(error)
      });
      return { exists: false };
    }
  }

  /**
   * Завершает регистрацию пользователя по токену установки пароля
   */
  static async completePasswordSetup(token: string, password: string): Promise<AutoRegistrationResult> {
    try {
      // Проверяем токен
      const tokenData = PasswordService.verifyPasswordSetupToken(token);
      if (!tokenData) {
        return {
          success: false,
          error: 'Недійсний або прострочений токен'
        };
      }

      // Получаем данные пользователя из временной записи
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', tokenData.email)
        .eq('status', 'pending_password_setup')
        .single();

      if (!userProfile) {
        return {
          success: false,
          error: 'Запис користувача не знайдено'
        };
      }

      // Проверяем надежность пароля
      const passwordCheck = PasswordService.validatePasswordStrength(password);
      if (!passwordCheck.valid) {
        return {
          success: false,
          error: passwordCheck.errors.join(', ')
        };
      }

      // Создаем пользователя в Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: tokenData.email,
        password: password,
        options: {
          data: {
            name: userProfile.name,
            phone: userProfile.phone
          }
        }
      });

      if (authError || !authData.user) {
        return {
          success: false,
          error: authError?.message || 'Не вдалося створити користувача'
        };
      }

      // Создаем запись в таблице users
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: tokenData.email,
          name: userProfile.name,
          phone: userProfile.phone,
          role: 'user',
          subscription_type: userProfile.subscription_type,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (userError) {
        logger.error('AutoRegistration: User record creation failed', {
          error: userError.message,
          userId: authData.user.id
        });
      }

      // Удаляем временную запись
      await supabase
        .from('user_profiles')
        .delete()
        .eq('email', tokenData.email)
        .eq('status', 'pending_password_setup');

      logger.info('AutoRegistration: Password setup completed', {
        email: tokenData.email,
        userId: authData.user.id
      });

      return {
        success: true,
        user: authData.user
      };

    } catch (error) {
      logger.error('AutoRegistration: Password setup completion error', {
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        success: false,
        error: 'Помилка при встановленні паролю'
      };
    }
  }
}