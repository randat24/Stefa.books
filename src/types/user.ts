// Типы пользователей и системы аренды
import type { Plan } from '@/store/ui';

// Статус пользователя
export type UserStatus = 'guest' | 'registered' | 'subscriber' | 'vip';

// Уровни пользователей (геймификация)  
export type UserLevel = 'beginner' | 'reader' | 'booklover' | 'master';

// Статус подписки
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'paused' | 'pending';

// Статус аренды
export type RentalStatus = 'active' | 'overdue' | 'returned' | 'exchanged' | 'cancelled';

// Основной интерфейс пользователя
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar_url?: string;
  
  // Статус и уровень
  status: UserStatus;
  level: UserLevel;
  
  // Подписка
  subscription_plan?: Plan;
  subscription_status?: SubscriptionStatus;
  subscription_start_date?: string;
  subscription_end_date?: string;
  
  // Статистика чтения
  books_read_count: number;
  total_rental_days: number;
  current_rentals_count: number;
  max_rentals_allowed: number;
  
  // Настройки
  reading_preferences?: string[];
  parental_controls?: boolean;
  notifications_enabled: boolean;
  
  // Даты
  created_at: string;
  updated_at: string;
  last_active_at?: string;
}

// Активная аренда книги
export interface ActiveRental {
  id: string;
  user_id: string;
  book_id: string;
  book_title: string;
  book_author: string;
  book_cover_url?: string;
  
  rented_at: string;
  return_by: string;
  exchange_count: number;
  max_exchanges: number;
  
  status: RentalStatus;
  notes?: string;
  
  // Расчетные поля
  days_left: number;
  is_overdue: boolean;
  can_exchange: boolean;
}

// История аренды
export interface RentalHistory {
  id: string;
  user_id: string;
  book_id: string;
  book_title: string;
  book_author: string;
  
  rented_at: string;
  returned_at?: string;
  planned_return_date: string;
  
  rating?: number; // 1-5 звезд
  review?: string;
  was_purchased: boolean;
  
  total_days: number;
  exchange_count: number;
  final_status: RentalStatus;
}

// Достижения пользователя
export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_type: AchievementType;
  earned_at: string;
  badge_icon: string;
  title: string;
  description: string;
}

// Типы достижений
export type AchievementType = 
  | 'first_rental'       // Первая аренда
  | 'week_reader'        // Неделя чтения
  | 'month_reader'       // Месяц активного чтения  
  | 'genre_explorer'     // Исследователь жанров
  | 'speed_reader'       // Скоростное чтение
  | 'loyal_subscriber'   // Верный подписчик
  | 'reviewer'           // Активный рецензент
  | 'recommender'        // Рекомендатель друзьям
  | 'collection_master'; // Мастер коллекций

// Настройки уведомлений
export interface NotificationSettings {
  email_enabled: boolean;
  push_enabled: boolean;
  
  // Типы уведомлений
  rental_reminders: boolean;        // Напоминания о возврате
  new_releases: boolean;            // Новинки
  recommendations: boolean;         // Рекомендации
  subscription_expiring: boolean;   // Окончание подписки
  achievements: boolean;            // Достижения
  special_offers: boolean;          // Спецпредложения
}

// Детали подписки пользователя
export interface UserSubscription {
  plan: Plan;
  status: SubscriptionStatus;
  start_date: string;
  end_date: string;
  
  // Лимиты
  max_books: number;
  rental_period_days: number;
  exchanges_per_month: number;
  
  // Использование
  current_rentals: number;
  exchanges_used_this_month: number;
  
  // Счетчики
  total_books_rented: number;
  total_amount_paid: number;
  
  // Автопродление
  auto_renewal: boolean;
  next_billing_date?: string;
}

// Функции-хелперы для работы с пользователями
export const getUserLevelInfo = (booksReadCount: number): { level: UserLevel; nextLevelBooks: number; progress: number } => {
  if (booksReadCount < 6) return { level: 'beginner', nextLevelBooks: 6 - booksReadCount, progress: (booksReadCount / 6) * 100 };
  if (booksReadCount < 21) return { level: 'reader', nextLevelBooks: 21 - booksReadCount, progress: ((booksReadCount - 6) / 15) * 100 };
  if (booksReadCount < 51) return { level: 'booklover', nextLevelBooks: 51 - booksReadCount, progress: ((booksReadCount - 21) / 30) * 100 };
  return { level: 'master', nextLevelBooks: 0, progress: 100 };
};

export const getLevelDisplayName = (level: UserLevel): string => {
  const names = {
    beginner: '🥉 Початківець',
    reader: '🥈 Читач', 
    booklover: '🥇 Книголюб',
    master: '💎 Майстер'
  };
  return names[level];
};

export const getSubscriptionDisplayName = (plan?: Plan): string => {
  if (!plan) return 'Без підписки';
  
  const names = {
    mini: '🌟 Mini',
    maxi: '🚀 Maxi', 
    premium: '👑 Premium',
    family: '🔥 Family'
  };
  return names[plan];
};

export const canRentBook = (user: User): { canRent: boolean; reason?: string } => {
  // Гость не может арендовать
  if (user.status === 'guest') {
    return { canRent: false, reason: 'Необхідна реєстрація' };
  }
  
  // Зарегистрированный без подписки
  if (user.status === 'registered' && !user.subscription_plan) {
    return { canRent: false, reason: 'Потрібна підписка для оренди книг' };
  }
  
  // Подписка истекла
  if (user.subscription_status === 'expired' || user.subscription_status === 'cancelled') {
    return { canRent: false, reason: 'Підписка закінчилася. Продовжте для продовження оренди' };
  }
  
  // Достигнут лимит аренды
  if (user.current_rentals_count >= user.max_rentals_allowed) {
    return { canRent: false, reason: `Досягнуто ліміт оренди (${user.max_rentals_allowed} книг)` };
  }
  
  return { canRent: true };
};