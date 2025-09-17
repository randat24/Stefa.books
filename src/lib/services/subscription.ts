/**
 * Сервис для управления подписками
 */

import { supabase } from '@/lib/supabase';
import { Logger } from '@/lib/logger';
import type {
  Subscription,
  SubscriptionType,
  CreateSubscriptionRequest,
  SubscriptionPlan,
  SUBSCRIPTION_PLANS
} from '@/lib/types/subscription';

export class SubscriptionService {
  private static logger = new Logger('SubscriptionService');

  /**
   * Получить план подписки
   */
  static getSubscriptionPlan(type: SubscriptionType): SubscriptionPlan {
    return SUBSCRIPTION_PLANS[type];
  }

  /**
   * Получить пользователя по email
   */
  static async getUserByEmail(email: string) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
        this.logger.error('Ошибка получения пользователя по email:', error);
        throw error;
      }

      return user;
    } catch (error) {
      this.logger.error('Ошибка получения пользователя по email:', error);
      throw error;
    }
  }

  /**
   * Обновить информацию о платеже подписки
   */
  static async updateSubscriptionPayment(
    subscriptionId: string,
    update: {
      monobank_invoice_id?: string;
      payment_url?: string;
    }
  ): Promise<void> {
    try {
      // Обновляем transaction_id в таблице payments
      const { error } = await supabase
        .from('payments')
        .update({
          transaction_id: update.monobank_invoice_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      if (error) {
        this.logger.error('Ошибка обновления платежа подписки:', error);
        throw error;
      }

      this.logger.info(`Обновлен платеж подписки ${subscriptionId}`);
    } catch (error) {
      this.logger.error('Ошибка обновления платежа подписки:', error);
      throw error;
    }
  }

  /**
   * Создать новую подписку
   */
  static async createSubscription(request: CreateSubscriptionRequest): Promise<Subscription> {
    try {
      const plan = SUBSCRIPTION_PLANS[request.subscription_type];
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + (request.duration_months || plan.duration_months));

      // Создаем подписку в таблице payments (используем существующую структуру)
      const { data: subscription, error } = await supabase
        .from('payments')
        .insert({
          user_id: request.user_id,
          amount_uah: plan.price,
          currency: 'UAH',
          description: `Підписка ${plan.name}`,
          payment_method: request.payment_method,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Ошибка создания подписки:', error);
        throw new Error('Не удалось создать подписку');
      }

      // Обновляем пользователя с информацией о подписке
      await this.updateUserSubscription(request.user_id, {
        subscription_type: request.subscription_type,
        subscription_start: startDate.toISOString(),
        subscription_end: endDate.toISOString()
      });

      this.logger.info(`Создана подписка ${subscription.id} для пользователя ${request.user_id}`);

      return {
        id: subscription.id,
        user_id: request.user_id,
        type: request.subscription_type,
        status: 'pending',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        payment_id: subscription.id,
        auto_renew: request.auto_renew || false,
        created_at: subscription.created_at,
        updated_at: subscription.updated_at
      };

    } catch (error) {
      this.logger.error('Ошибка создания подписки:', error);
      throw error;
    }
  }

  /**
   * Активировать подписку после успешной оплаты
   */
  static async activateSubscription(paymentId: string): Promise<void> {
    try {
      // Получаем информацию о платеже
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (paymentError || !payment) {
        throw new Error('Платеж не найден');
      }

      // Обновляем статус платежа
      await supabase
        .from('payments')
        .update({
          status: 'completed',
          payment_date: new Date().toISOString()
        })
        .eq('id', paymentId);

      // Получаем информацию о пользователе
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', payment.user_id)
        .single();

      if (userError || !user) {
        throw new Error('Пользователь не найден');
      }

      // Если пользователь уже существует, просто обновляем статус подписки
      await supabase
        .from('users')
        .update({
          status: 'active'
        })
        .eq('id', payment.user_id);

      this.logger.info(`Активирована подписка для пользователя ${payment.user_id}`);

    } catch (error) {
      this.logger.error('Ошибка активации подписки:', error);
      throw error;
    }
  }

  /**
   * Создать пользователя с подпиской
   */
  static async createUserWithSubscription(
    email: string,
    name: string,
    phone: string,
    address: string,
    subscriptionType: SubscriptionType
  ): Promise<{ userId: string; subscriptionId: string }> {
    try {
      // Создаем пользователя
      const userId = crypto.randomUUID();
      const plan = SUBSCRIPTION_PLANS[subscriptionType];
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + plan.duration_months);

      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email,
          name,
          phone,
          address,
          subscription_type: subscriptionType,
          subscription_start: startDate.toISOString(),
          subscription_end: endDate.toISOString(),
          status: 'pending',
          role: 'user'
        });

      if (userError) {
        this.logger.error('Ошибка создания пользователя:', userError);
        throw new Error('Не удалось создать пользователя');
      }

      // Создаем подписку
      const subscription = await this.createSubscription({
        user_id: userId,
        subscription_type: subscriptionType,
        payment_method: 'monobank'
      });

      this.logger.info(`Создан пользователь ${userId} с подпиской ${subscription.id}`);

      return {
        userId,
        subscriptionId: subscription.id
      };

    } catch (error) {
      this.logger.error('Ошибка создания пользователя с подпиской:', error);
      throw error;
    }
  }

  /**
   * Получить активную подписку пользователя
   */
  static async getUserSubscription(userId: string): Promise<Subscription | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user || !user.subscription_type) {
        return null;
      }

      // Проверяем, не истекла ли подписка
      const endDate = new Date(user.subscription_end || '');
      const now = new Date();
      const status = endDate > now ? 'active' : 'expired';

      return {
        id: crypto.randomUUID(), // Временный ID
        user_id: userId,
        type: user.subscription_type as SubscriptionType,
        status: status as any,
        start_date: user.subscription_start || '',
        end_date: user.subscription_end || '',
        auto_renew: false,
        created_at: user.created_at || '',
        updated_at: user.updated_at || ''
      };

    } catch (error) {
      this.logger.error('Ошибка получения подписки:', error);
      return null;
    }
  }

  /**
   * Обновить информацию о подписке пользователя
   */
  private static async updateUserSubscription(
    userId: string,
    update: {
      subscription_type?: SubscriptionType;
      subscription_start?: string;
      subscription_end?: string;
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update(update)
      .eq('id', userId);

    if (error) {
      this.logger.error('Ошибка обновления подписки пользователя:', error);
      throw new Error('Не удалось обновить подписку');
    }
  }

  /**
   * Проверить доступ к книгам по подписке
   */
  static async checkBookAccess(userId: string): Promise<{
    hasAccess: boolean;
    maxBooks: number;
    currentBooks: number;
  }> {
    try {
      const subscription = await this.getUserSubscription(userId);

      if (!subscription || subscription.status !== 'active') {
        return { hasAccess: false, maxBooks: 0, currentBooks: 0 };
      }

      const plan = SUBSCRIPTION_PLANS[subscription.type];

      // Получаем количество активных аренд
      const { data: rentals, error } = await supabase
        .from('rentals')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) {
        this.logger.error('Ошибка получения аренд:', error);
        return { hasAccess: false, maxBooks: 0, currentBooks: 0 };
      }

      const currentBooks = rentals?.length || 0;
      const hasAccess = currentBooks < plan.max_books;

      return {
        hasAccess,
        maxBooks: plan.max_books,
        currentBooks
      };

    } catch (error) {
      this.logger.error('Ошибка проверки доступа:', error);
      return { hasAccess: false, maxBooks: 0, currentBooks: 0 };
    }
  }
}