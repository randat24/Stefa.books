import { logger } from './logger';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    encoding?: string;
  }>;
}

interface SubscriptionNotification {
  submissionId: string;
  customerData: {
    name: string;
    email: string;
    phone: string;
    plan: string;
    paymentMethod: string;
  };
  hasScreenshot?: boolean;
}

interface RentalNotification {
  rentalId: string;
  customerData: {
    name: string;
    email: string;
    phone: string;
    bookId?: string;
    plan: string;
  };
}

class EmailService {
  private isConfigured = false;

  constructor() {
    // Check if email service is configured
    this.isConfigured = !!(
      process.env.EMAIL_SERVICE_API_KEY ||
      process.env.SMTP_HOST
    );
  }

  private async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured) {
      logger.warn('Email service not configured, skipping email send', { to: options.to, subject: options.subject });
      return false;
    }

    try {
      // Here you would integrate with your email service:
      // - SendGrid
      // - NodeMailer with SMTP
      // - Resend
      // - AWS SES
      
      logger.info('Email would be sent (service not configured)', {
        to: options.to,
        subject: options.subject,
        hasHtml: !!options.html,
        hasAttachments: !!options.attachments?.length
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to send email', error);
      return false;
    }
  }

  async sendSubscriptionNotification(data: SubscriptionNotification): Promise<boolean> {
    const { submissionId, customerData, hasScreenshot } = data;
    
    // Admin notification
    const adminEmailSent = await this.sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@stefa-books.com',
      subject: `Нова заявка на підписку - ${customerData.plan}`,
      html: `
        <h2>Нова заявка на підписку</h2>
        <p><strong>ID заявки:</strong> ${submissionId}</p>
        <p><strong>Ім'я:</strong> ${customerData.name}</p>
        <p><strong>Email:</strong> ${customerData.email}</p>
        <p><strong>Телефон:</strong> ${customerData.phone}</p>
        <p><strong>План:</strong> ${customerData.plan}</p>
        <p><strong>Спосіб оплати:</strong> ${customerData.paymentMethod}</p>
        <p><strong>Скріншот:</strong> ${hasScreenshot ? 'Так' : 'Ні'}</p>
        <p><strong>Дата:</strong> ${new Date().toLocaleString('uk-UA')}</p>
      `
    });

    // Customer confirmation
    const customerEmailSent = await this.sendEmail({
      to: customerData.email,
      subject: 'Підтвердження заявки на підписку - Stefa.books',
      html: `
        <h2>Дякуємо за заявку!</h2>
        <p>Шановний(-а) ${customerData.name},</p>
        <p>Ми отримали вашу заявку на підписку <strong>${customerData.plan}</strong>.</p>
        <p><strong>ID заявки:</strong> ${submissionId}</p>
        <p>Наш менеджер зв'яжеться з вами найближчим часом для підтвердження деталей.</p>
        <br>
        <p>З повагою,<br>Команда Stefa.books</p>
      `
    });

    return adminEmailSent && customerEmailSent;
  }

  async sendRentalNotification(data: RentalNotification): Promise<boolean> {
    const { rentalId, customerData } = data;
    
    // Admin notification
    const adminEmailSent = await this.sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@stefa-books.com',
      subject: `Нова заявка на оренду книги`,
      html: `
        <h2>Нова заявка на оренду</h2>
        <p><strong>ID заявки:</strong> ${rentalId}</p>
        <p><strong>Ім'я:</strong> ${customerData.name}</p>
        <p><strong>Email:</strong> ${customerData.email}</p>
        <p><strong>Телефон:</strong> ${customerData.phone}</p>
        <p><strong>ID книги:</strong> ${customerData.bookId || 'Не вказано'}</p>
        <p><strong>План:</strong> ${customerData.plan}</p>
        <p><strong>Дата:</strong> ${new Date().toLocaleString('uk-UA')}</p>
      `
    });

    // Customer confirmation
    const customerEmailSent = await this.sendEmail({
      to: customerData.email,
      subject: 'Підтвердження заявки на оренду - Stefa.books',
      html: `
        <h2>Дякуємо за заявку на оренду!</h2>
        <p>Шановний(-а) ${customerData.name},</p>
        <p>Ми отримали вашу заявку на оренду книги.</p>
        <p><strong>ID заявки:</strong> ${rentalId}</p>
        <p>Наш менеджер зв'яжеться з вами для підтвердження наявності книги та деталей видачі.</p>
        <br>
        <p>З повагою,<br>Команда Stefa.books</p>
      `
    });

    return adminEmailSent && customerEmailSent;
  }
}

export const emailService = new EmailService();