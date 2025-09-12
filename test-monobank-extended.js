#!/usr/bin/env node

// Розширений тест Monobank API для перевірки можливості створення платежів
require('dotenv').config({ path: '.env.local' });

const MONOBANK_TOKEN = process.env.MONOBANK_TOKEN;

async function testExtendedMonobankAPI() {
  console.log('🔍 Тестуємо розширені можливості Monobank API...\n');

  try {
    // Тест 1: Спроба створити платіж через особистий токен
    console.log('1️⃣ Тестуємо створення платежу...');
    
    const paymentData = {
      amount: 50000, // 500 грн в копійках
      ccy: 980, // UAH
      merchantPaymInfo: {
        reference: `test-${Date.now()}`,
        destination: 'Тестовий платіж',
        basketOrder: [{
          name: 'Тестова послуга',
          qty: 1,
          sum: 50000
        }]
      },
      redirectUrl: 'https://stefa-books.com.ua/payment/success',
      webHookUrl: 'https://stefa-books.com.ua/api/payments/monobank/webhook',
      validity: 3600, // 1 година
      paymentType: 'debit'
    };

    // Спробуємо різні endpoint'и
    const endpoints = [
      'https://api.monobank.ua/api/merchant/invoice/create',
      'https://api.monobank.ua/merchant/invoice/create',
      'https://api.monobank.ua/personal/invoice/create',
      'https://api.monobank.ua/invoice/create'
    ];

    for (const endpoint of endpoints) {
      console.log(`   Пробуємо: ${endpoint}`);
      
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Token': MONOBANK_TOKEN
          },
          body: JSON.stringify(paymentData)
        });

        console.log(`   Статус: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Платіж створено успішно!');
          console.log('   Invoice ID:', data.invoiceId);
          console.log('   Payment URL:', data.pageUrl);
          return data; // Повертаємо дані успішного платежу
        } else {
          const errorText = await response.text();
          console.log(`   Помилка: ${errorText}`);
        }
      } catch (error) {
        console.log(`   Помилка запиту: ${error.message}`);
      }
    }

    // Тест 2: Перевіримо можливість отримання курсів валют
    console.log('\n2️⃣ Тестуємо отримання курсів валют...');
    try {
      const ratesResponse = await fetch('https://api.monobank.ua/bank/currency');
      
      if (ratesResponse.ok) {
        const rates = await ratesResponse.json();
        console.log('✅ Курси валют отримано:');
        rates.slice(0, 3).forEach(rate => {
          const currencyA = rate.currencyCodeA === 840 ? 'USD' : 
                          rate.currencyCodeA === 978 ? 'EUR' : 
                          rate.currencyCodeA;
          const currencyB = rate.currencyCodeB === 980 ? 'UAH' : rate.currencyCodeB;
          
          if (rate.rateSell) {
            console.log(`   ${currencyA}/${currencyB}: купівля ${rate.rateBuy}, продаж ${rate.rateSell}`);
          }
        });
      }
    } catch (error) {
      console.log(`❌ Помилка отримання курсів: ${error.message}`);
    }

    // Тест 3: Перевіримо можливість налаштування webhook'у
    console.log('\n3️⃣ Тестуємо налаштування webhook...');
    try {
      const webhookResponse = await fetch('https://api.monobank.ua/personal/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Token': MONOBANK_TOKEN
        },
        body: JSON.stringify({
          webHookUrl: 'https://stefa-books.com.ua/api/monobank/webhook'
        })
      });

      console.log(`   Статус webhook: ${webhookResponse.status}`);
      
      if (webhookResponse.ok) {
        console.log('✅ Webhook налаштовано успішно');
      } else {
        const errorText = await webhookResponse.text();
        console.log(`   Деталі: ${errorText}`);
      }
    } catch (error) {
      console.log(`   Помилка webhook: ${error.message}`);
    }

    // Тест 4: Перевіримо можливість створення QR-коду для платежу
    console.log('\n4️⃣ Тестуємо створення QR-коду...');
    try {
      const qrResponse = await fetch('https://api.monobank.ua/personal/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Token': MONOBANK_TOKEN
        },
        body: JSON.stringify({
          amount: 50000,
          description: 'Тестовий QR платіж'
        })
      });

      console.log(`   Статус QR: ${qrResponse.status}`);
      
      if (qrResponse.ok) {
        const qrData = await qrResponse.json();
        console.log('✅ QR код створено');
        console.log('   QR ID:', qrData.qrId);
      } else {
        const errorText = await qrResponse.text();
        console.log(`   Деталі: ${errorText}`);
      }
    } catch (error) {
      console.log(`   Помилка QR: ${error.message}`);
    }

    console.log('\n📋 Висновки:');
    console.log('   Тестування завершено. Перевірте результати вище.');
    
  } catch (error) {
    console.log(`❌ Загальна помилка: ${error.message}`);
  }
}

testExtendedMonobankAPI();