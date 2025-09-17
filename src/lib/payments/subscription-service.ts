import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

export interface SubscriptionActivationData {
  requestId: string
  invoiceId: string
  amount: number
  paymentMethod: string
}

export interface SubscriptionServiceResponse {
  success: boolean
  error?: string
  data?: {
    subscriptionId: string
    status: string
  }
}

export class SubscriptionService {
  private supabase

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing')
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })
  }

  /**
   * Активировать подписку после успешной оплаты
   */
  async activateSubscription(data: SubscriptionActivationData): Promise<SubscriptionServiceResponse> {
    try {
      logger.info('SubscriptionService: Activating subscription', {
        requestId: data.requestId,
        invoiceId: data.invoiceId,
        amount: data.amount
      })

      // 1. Найти заявку на подписку
      const { data: subscriptionRequest, error: fetchError } = await this.supabase
        .from('subscription_requests')
        .select('*')
        .eq('id', data.requestId)
        .single()

      if (fetchError || !subscriptionRequest) {
        logger.error('SubscriptionService: Subscription request not found', {
          requestId: data.requestId,
          error: fetchError
        })
        return {
          success: false,
          error: 'Subscription request not found'
        }
      }

      // 2. Обновить статус заявки на 'completed'
      const { error: updateError } = await this.supabase
        .from('subscription_requests')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
          admin_notes: `Активировано через Monobank. Invoice ID: ${data.invoiceId}`
        })
        .eq('id', data.requestId)

      if (updateError) {
        logger.error('SubscriptionService: Failed to update subscription request', {
          requestId: data.requestId,
          error: updateError
        })
        return {
          success: false,
          error: 'Failed to update subscription request'
        }
      }

      // 3. Найти или создать пользователя в таблице users
      let userId: string
      
      // Сначала попробуем найти существующего пользователя
      const { data: existingUser } = await this.supabase
        .from('users')
        .select('id')
        .eq('email', subscriptionRequest.email)
        .single()

      if (existingUser) {
        userId = existingUser.id
        logger.info('SubscriptionService: Found existing user', { userId, email: subscriptionRequest.email })
      } else {
        // Создаем нового пользователя
        const { data: newUser, error: userError } = await this.supabase
          .from('users')
          .insert({
            name: subscriptionRequest.name,
            email: subscriptionRequest.email,
            phone: subscriptionRequest.phone,
            subscription_type: subscriptionRequest.plan,
            subscription_start: new Date().toISOString(),
            subscription_end: this.calculateExpirationDate(subscriptionRequest.plan),
            status: 'active'
          })
          .select()
          .single()

        if (userError || !newUser) {
          logger.error('SubscriptionService: Failed to create user', {
            error: userError,
            email: subscriptionRequest.email
          })
          return {
            success: false,
            error: 'Failed to create user'
          }
        }

        userId = newUser.id
        logger.info('SubscriptionService: Created new user', { userId, email: subscriptionRequest.email })
      }

      // 4. Обновить подписку пользователя
      const { error: subscriptionError } = await this.supabase
        .from('users')
        .update({
          subscription_type: subscriptionRequest.plan,
          subscription_start: new Date().toISOString(),
          subscription_end: this.calculateExpirationDate(subscriptionRequest.plan),
          status: 'active',
          notes: `Активировано через Monobank. Invoice ID: ${data.invoiceId}`
        })
        .eq('id', userId)

      if (subscriptionError) {
        logger.error('SubscriptionService: Failed to update user subscription', {
          userId,
          error: subscriptionError
        })
        return {
          success: false,
          error: 'Failed to update user subscription'
        }
      }

      logger.info('SubscriptionService: Subscription activated successfully', {
        userId,
        requestId: data.requestId,
        plan: subscriptionRequest.plan
      })

      return {
        success: true,
        data: {
          subscriptionId: userId, // Используем userId как subscriptionId
          status: 'active'
        }
      }
    } catch (error) {
      logger.error('SubscriptionService: Activation error', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Проверить статус подписки
   */
  async getSubscriptionStatus(subscriptionId: string): Promise<SubscriptionServiceResponse> {
    try {
      const { data: user, error } = await this.supabase
        .from('users')
        .select('id, subscription_type, subscription_start, subscription_end, status')
        .eq('id', subscriptionId)
        .single()

      if (error || !user) {
        return {
          success: false,
          error: 'User not found'
        }
      }

      // Проверяем, активна ли подписка
      const isActive = user.status === 'active' && 
        user.subscription_end && 
        new Date(user.subscription_end) > new Date()

      return {
        success: true,
        data: {
          subscriptionId: user.id,
          status: isActive ? 'active' : 'inactive'
        }
      }
    } catch (error) {
      logger.error('SubscriptionService: Get status error', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Отменить подписку
   */
  async cancelSubscription(subscriptionId: string): Promise<SubscriptionServiceResponse> {
    try {
      const { error } = await this.supabase
        .from('users')
        .update({
          status: 'inactive',
          notes: `Подписка отменена ${new Date().toISOString()}`
        })
        .eq('id', subscriptionId)

      if (error) {
        logger.error('SubscriptionService: Failed to cancel subscription', {
          subscriptionId,
          error
        })
        return {
          success: false,
          error: 'Failed to cancel subscription'
        }
      }

      logger.info('SubscriptionService: Subscription cancelled', { subscriptionId })

      return {
        success: true,
        data: {
          subscriptionId,
          status: 'cancelled'
        }
      }
    } catch (error) {
      logger.error('SubscriptionService: Cancel error', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Вычислить дату окончания подписки
   */
  private calculateExpirationDate(plan: string): string {
    const now = new Date()
    let months = 1 // По умолчанию 1 месяц

    switch (plan) {
      case 'mini':
        months = 1
        break
      case 'maxi':
        months = 3
        break
      case 'premium':
        months = 6
        break
      default:
        months = 1
    }

    const expirationDate = new Date(now.getTime() + (months * 30 * 24 * 60 * 60 * 1000))
    return expirationDate.toISOString()
  }
}

// Экспортируем singleton instance
export const subscriptionService = new SubscriptionService()
