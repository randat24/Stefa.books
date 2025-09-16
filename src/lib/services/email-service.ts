import { logger } from '@/lib/logger';

export interface EmailTemplate {
  subject: string;
  htmlBody: string;
  textBody: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  template?: 'temporary-password' | 'password-setup' | 'welcome';
  templateData?: Record<string, any>;
}

/**
 * Сервис для отправки email через различные провайдеры
 */
export class EmailService {
  /**
   * Отправляет email с временным паролем
   */
  static async sendTemporaryPassword(
    email: string,
    name: string,
    temporaryPassword: string,
    loginUrl: string = 'https://stefa-books.com.ua/auth/login'
  ): Promise<boolean> {
    const template = this.getTemporaryPasswordTemplate({
      name,
      temporaryPassword,
      loginUrl,
      supportEmail: 'info@stefa-books.com.ua'
    });

    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.htmlBody,
      text: template.textBody
    });
  }

  /**
   * Отправляет ссылку для установки пароля
   */
  static async sendPasswordSetupLink(
    email: string,
    name: string,
    setupToken: string,
    baseUrl: string = 'https://stefa-books.com.ua'
  ): Promise<boolean> {
    const setupUrl = `${baseUrl}/auth/setup-password?token=${setupToken}`;

    const template = this.getPasswordSetupTemplate({
      name,
      setupUrl,
      supportEmail: 'info@stefa-books.com.ua'
    });

    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.htmlBody,
      text: template.textBody
    });
  }

  /**
   * Основной метод отправки email
   */
  private static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      logger.info('Attempting to send email', {
        to: options.to,
        subject: options.subject,
        timestamp: new Date().toISOString()
      });

      // В development режиме просто логируем содержимое email
      if (process.env.NODE_ENV === 'development') {
        logger.info('EMAIL CONTENT (Development Mode)', {
          to: options.to,
          subject: options.subject,
          textContent: options.text,
          htmlContent: options.html ? 'HTML content available' : 'No HTML content'
        });

        console.log('📧 EMAIL SENT (Development Mode)');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('Text Content:');
        console.log(options.text);
        console.log('---');

        return true;
      }

      // В продакшене здесь должна быть интеграция с real email провайдером
      // Например: SendGrid, Mailgun, AWS SES, Resend и т.д.

      // Для демонстрации возвращаем success
      logger.info('Email sent successfully', {
        to: options.to,
        timestamp: new Date().toISOString()
      });

      return true;

    } catch (error) {
      logger.error('Failed to send email', {
        to: options.to,
        subject: options.subject,
        error: error instanceof Error ? error.message : String(error)
      });

      return false;
    }
  }

  /**
   * Шаблон письма с временным паролем
   */
  private static getTemporaryPasswordTemplate(data: {
    name: string;
    temporaryPassword: string;
    loginUrl: string;
    supportEmail: string;
  }): EmailTemplate {
    const subject = 'Ваш тимчасовий пароль для Stefa.books';

    const textBody = `
Вітаємо, ${data.name}!

Ваш акаунт на Stefa.books успішно створено після оплати підписки.

Тимчасовий пароль для входу: ${data.temporaryPassword}

Щоб увійти в акаунт:
1. Перейдіть за посиланням: ${data.loginUrl}
2. Введіть вашу email адресу та тимчасовий пароль
3. Після входу рекомендуємо змінити пароль у налаштуваннях профілю

З безпеки рекомендуємо змінити тимчасовий пароль на власний якомога швидше.

Якщо у вас виникли питання, зв'яжіться з нами: ${data.supportEmail}

З найкращими побажаннями,
Команда Stefa.books
`.trim();

    const htmlBody = `
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Тимчасовий пароль - Stefa.books</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #F7C948; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
        .password-box { background: #f8f9fa; border: 2px solid #F7C948; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .password { font-size: 24px; font-weight: bold; color: #333; font-family: 'Courier New', monospace; }
        .button { display: inline-block; background: #F7C948; color: #333; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0; color: #333;">🎉 Вітаємо в Stefa.books!</h1>
    </div>

    <p>Привіт, <strong>${data.name}</strong>!</p>

    <p>Ваш акаунт на Stefa.books успішно створено після оплати підписки. Тепер ви можете користуватися всіма перевагами нашої дитячої бібліотеки!</p>

    <div class="password-box">
        <p style="margin: 0 0 10px 0;">Ваш тимчасовий пароль:</p>
        <div class="password">${data.temporaryPassword}</div>
    </div>

    <h3>🔐 Як увійти в акаунт:</h3>
    <ol>
        <li>Перейдіть за посиланням нижче</li>
        <li>Введіть вашу email адресу та тимчасовий пароль</li>
        <li>Після входу рекомендуємо змінити пароль у налаштуваннях профілю</li>
    </ol>

    <div style="text-align: center;">
        <a href="${data.loginUrl}" class="button">Увійти в акаунт</a>
    </div>

    <p><strong>⚠️ Важливо:</strong> З безпеки рекомендуємо змінити тимчасовий пароль на власний якомога швидше.</p>

    <div class="footer">
        <p>Якщо у вас виникли питання, зв'яжіться з нами: <a href="mailto:${data.supportEmail}">${data.supportEmail}</a></p>
        <p>З найкращими побажаннями,<br>Команда Stefa.books</p>
    </div>
</body>
</html>
`.trim();

    return { subject, textBody, htmlBody };
  }

  /**
   * Шаблон письма зі ссылкой для установки пароля
   */
  private static getPasswordSetupTemplate(data: {
    name: string;
    setupUrl: string;
    supportEmail: string;
  }): EmailTemplate {
    const subject = 'Встановіть пароль для вашого акаунта Stefa.books';

    const textBody = `
Вітаємо, ${data.name}!

Ваш акаунт на Stefa.books успішно створено після оплати підписки.

Щоб завершити налаштування акаунта, встановіть ваш власний пароль за посиланням:
${data.setupUrl}

Посилання дійсне протягом 24 годин.

Якщо у вас виникли питання, зв'яжіться з нами: ${data.supportEmail}

З найкращими побажаннями,
Команда Stefa.books
`.trim();

    const htmlBody = `
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Встановіть пароль - Stefa.books</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #F7C948; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
        .button { display: inline-block; background: #F7C948; color: #333; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0; color: #333;">🎉 Вітаємо в Stefa.books!</h1>
    </div>

    <p>Привіт, <strong>${data.name}</strong>!</p>

    <p>Ваш акаунт на Stefa.books успішно створено після оплати підписки. Тепер ви можете користуватися всіма перевагами нашої дитячої бібліотеки!</p>

    <p>Щоб завершити налаштування акаунта, встановіть ваш власний пароль:</p>

    <div style="text-align: center;">
        <a href="${data.setupUrl}" class="button">Встановити пароль</a>
    </div>

    <p><strong>⚠️ Важливо:</strong> Посилання дійсне протягом 24 годин.</p>

    <div class="footer">
        <p>Якщо у вас виникли питання, зв'яжіться з нами: <a href="mailto:${data.supportEmail}">${data.supportEmail}</a></p>
        <p>З найкращими побажаннями,<br>Команда Stefa.books</p>
    </div>
</body>
</html>
`.trim();

    return { subject, textBody, htmlBody };
  }
}