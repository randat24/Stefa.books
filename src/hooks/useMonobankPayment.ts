'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { logger } from '@/lib/logger';

interface PaymentData {
  invoice_id: string;
  status: string;
  payment_url: string;
  amount: number;
  currency: string;
  description: string;
  expires_at: string;
  created_at: string;
}

interface CreatePaymentRequest {
  amount: number;
  description: string;
  currency?: string;
  customer_email?: string;
  customer_name?: string;
  order_id?: string;
  return_url?: string;
}

interface UseMonobankPaymentReturn {
  payment: PaymentData | null;
  loading: boolean;
  error: string | null;
  paymentStatus: 'pending' | 'success' | 'failed' | 'checking' | null;
  createPayment: (data: CreatePaymentRequest) => Promise<void>;
  checkPaymentStatus: (invoiceId: string) => Promise<void>;
  reset: () => void;
}

export function useMonobankPayment(): UseMonobankPaymentReturn {
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | 'checking' | null>(null);

  const createPayment = useCallback(async (data: CreatePaymentRequest) => {
    setLoading(true);
    setError(null);
    setPaymentStatus(null);

    try {
      logger.info('Creating Monobank payment', {
        amount: data.amount,
        description: data.description,
        currency: data.currency,
        customer_email: data.customer_email
      });

      const response = await fetch('/api/payments/monobank', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          currency: data.currency || 'UAH',
          order_id: data.order_id || `order-${Date.now()}`
        }) });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Помилка створення платежу');
      }

      setPayment(result.payment);
      setPaymentStatus('pending');
      
      logger.info('Monobank payment created successfully', {
        invoice_id: result.payment.invoice_id,
        payment_url: result.payment.payment_url
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Невідома помилка';
      setError(errorMessage);
      
      logger.error('Failed to create Monobank payment', {
        error: errorMessage,
        ...data
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const checkPaymentStatus = useCallback(async (invoiceId: string) => {
    setPaymentStatus('checking');
    setError(null);
    
    try {
      logger.info('Checking Monobank payment status', { invoiceId });

      const response = await fetch(`/api/payments/monobank?invoice_id=${invoiceId}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Помилка перевірки статусу платежу');
      }

      const status = data.payment.status;
      setPaymentStatus(status);

      // Оновлюємо дані платежу, якщо вони є
      if (payment) {
        setPayment(prev => prev ? { ...prev, status } : prev);
      }

      logger.info('Payment status checked', { 
        invoiceId, 
        status 
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Помилка перевірки статусу';
      setError(errorMessage);
      
      logger.error('Failed to check payment status', { 
        error: errorMessage, 
        invoiceId 
      });
    }
  }, [payment]);

  const reset = useCallback(() => {
    setPayment(null);
    setLoading(false);
    setError(null);
    setPaymentStatus(null);
  }, []);

  return {
    payment,
    loading,
    error,
    paymentStatus,
    createPayment,
    checkPaymentStatus,
    reset
  };
}

// Окремий хук для автоматичної перевірки статусу
export function usePaymentStatusPolling(
  invoiceId: string | null,
  interval = 5000,
  enabled = true
) {
  const { checkPaymentStatus, paymentStatus } = useMonobankPayment();

  // Використовуємо useEffect для поллінгу
  useEffect(() => {
    if (!invoiceId || !enabled || paymentStatus === 'success' || paymentStatus === 'failed') {
      return;
    }

    const pollInterval = setInterval(() => {
      checkPaymentStatus(invoiceId);
    }, interval);

    return () => clearInterval(pollInterval);
  }, [invoiceId, enabled, paymentStatus, interval, checkPaymentStatus]);

  return { paymentStatus, checkPaymentStatus };
}

// Утиліти для роботи з платежами
export const paymentUtils = {
  // Форматування суми для відображення
  formatAmount: (amount: number, currency = 'UAH') => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2 }).format(amount);
  },

  // Перевірка чи платіж активний
  isPaymentActive: (expiresAt: string) => {
    return new Date(expiresAt) > new Date();
  },

  // Час до закінчення платежу
  getTimeUntilExpiry: (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return null;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours} год ${minutes % 60} хв`;
    }
    return `${minutes} хв`;
  },

  // Генерація QR коду для платежу (якщо потрібно)
  generateQRCodeUrl: (paymentUrl: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentUrl)}`;
  }
};