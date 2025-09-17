import { logger } from '@/lib/logger';

// ============================================================================
// MONOBANK API SERVICE
// ============================================================================

export interface MonobankCurrencyRate {
  currencyCodeA: number;
  currencyCodeB: number;
  date: number;
  rateSell: number;
  rateBuy: number;
  rateCross: number;
}

export interface MonobankClientInfo {
  clientId: string;
  name: string;
  webHookUrl: string;
  permissions: string;
  accounts: Array<{
    id: string;
    sendId: string;
    balance: number;
    creditLimit: number;
    type: string;
    currencyCode: number;
    cashbackType: string;
    maskedPan: string[];
    iban: string;
  }>;
  jars: Array<{
    id: string;
    sendId: string;
    title: string;
    description: string;
    currencyCode: number;
    balance: number;
    goal: number;
  }>;
  managedClients: Array<{
    clientId: string;
    tin: number;
    name: string;
    accounts: Array<{
      id: string;
      balance: number;
      creditLimit: number;
      type: string;
      currencyCode: number;
      iban: string;
    }>;
  }>;
}

export interface MonobankStatementItem {
  id: string;
  time: number;
  description: string;
  mcc: number;
  originalMcc: number;
  hold: boolean;
  amount: number;
  operationAmount: number;
  currencyCode: number;
  commissionRate: number;
  cashbackAmount: number;
  balance: number;
  comment: string;
  receiptId: string;
  invoiceId: string;
  counterEdrpou: string;
  counterIban: string;
  counterName: string;
}

class MonobankService {
  private readonly baseUrl = 'https://api.monobank.ua';
  private readonly token: string;

  constructor() {
    this.token = process.env.MONOBANK_TOKEN || '';
    if (!this.token) {
      logger.warn('MonobankService: MONOBANK_TOKEN not provided');
    }
  }

  /**
   * Get currency rates from Monobank
   */
  async getCurrencyRates(): Promise<MonobankCurrencyRate[]> {
    try {
      const response = await fetch(`${this.baseUrl}/bank/currency`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json' } });

      if (!response.ok) {
        throw new Error(`Monobank API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      logger.info('MonobankService: Currency rates fetched successfully');
      return data;
    } catch (error) {
      logger.error('MonobankService: Error fetching currency rates', error);
      throw error;
    }
  }

  /**
   * Get client information (requires token)
   */
  async getClientInfo(): Promise<MonobankClientInfo> {
    if (!this.token) {
      throw new Error('Monobank token is required for client info');
    }

    try {
      const response = await fetch(`${this.baseUrl}/personal/client-info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Token': this.token } });

      if (!response.ok) {
        throw new Error(`Monobank API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      logger.info('MonobankService: Client info fetched successfully');
      return data;
    } catch (error) {
      logger.error('MonobankService: Error fetching client info', error);
      throw error;
    }
  }

  /**
   * Get account statement (requires token)
   */
  async getStatement(
    account: string,
    from: number,
    to?: number
  ): Promise<MonobankStatementItem[]> {
    if (!this.token) {
      throw new Error('Monobank token is required for statement');
    }

    try {
      const toParam = to || Math.floor(Date.now() / 1000);
      const response = await fetch(
        `${this.baseUrl}/personal/statement/${account}/${from}/${toParam}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Token': this.token } }
      );

      if (!response.ok) {
        throw new Error(`Monobank API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      logger.info('MonobankService: Statement fetched successfully', { account, from, to: toParam });
      return data;
    } catch (error) {
      logger.error('MonobankService: Error fetching statement', error);
      throw error;
    }
  }

  /**
   * Set webhook URL (requires token)
   */
  async setWebhook(webhookUrl: string): Promise<boolean> {
    if (!this.token) {
      throw new Error('Monobank token is required for webhook setup');
    }

    try {
      const response = await fetch(`${this.baseUrl}/personal/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Token': this.token },
        body: JSON.stringify({ webHookUrl: webhookUrl }) });

      if (!response.ok) {
        throw new Error(`Monobank API error: ${response.status} ${response.statusText}`);
      }

      logger.info('MonobankService: Webhook set successfully', { webhookUrl });
      return true;
    } catch (error) {
      logger.error('MonobankService: Error setting webhook', error);
      throw error;
    }
  }

  /**
   * Check if payment was received by looking for specific amount in statement
   */
  async checkPaymentReceived(
    account: string,
    amount: number,
    description?: string,
    timeWindowHours: number = 24
  ): Promise<{ received: boolean; transaction?: MonobankStatementItem }> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const from = now - (timeWindowHours * 60 * 60);
      
      const statement = await this.getStatement(account, from, now);
      
      // Look for transaction with matching amount
      const matchingTransaction = statement.find(item => {
        const amountMatches = Math.abs(item.amount) === Math.abs(amount);
        const descriptionMatches = !description || 
          item.description.toLowerCase().includes(description.toLowerCase());
        
        return amountMatches && descriptionMatches;
      });

      if (matchingTransaction) {
        logger.info('MonobankService: Payment found in statement', {
          transactionId: matchingTransaction.id,
          amount: matchingTransaction.amount,
          description: matchingTransaction.description
        });
        
        return {
          received: true,
          transaction: matchingTransaction
        };
      }

      logger.info('MonobankService: Payment not found in statement', { amount, description });
      return { received: false };
    } catch (error) {
      logger.error('MonobankService: Error checking payment', error);
      return { received: false };
    }
  }

  /**
   * Get UAH to USD exchange rate
   */
  async getUahToUsdRate(): Promise<number | null> {
    try {
      const rates = await this.getCurrencyRates();
      const usdRate = rates.find(rate => rate.currencyCodeA === 840 && rate.currencyCodeB === 980);
      
      if (usdRate) {
        return usdRate.rateSell;
      }
      
      return null;
    } catch (error) {
      logger.error('MonobankService: Error getting USD rate', error);
      return null;
    }
  }

  /**
   * Convert UAH to USD using current exchange rate
   */
  async convertUahToUsd(uahAmount: number): Promise<number | null> {
    try {
      const rate = await this.getUahToUsdRate();
      if (rate) {
        return uahAmount / rate;
      }
      return null;
    } catch (error) {
      logger.error('MonobankService: Error converting UAH to USD', error);
      return null;
    }
  }
}

// Export singleton instance
export const monobankService = new MonobankService();
