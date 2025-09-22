#!/usr/bin/env node

/**
 * Скрипт для обновления типов базы данных
 * Добавляет типы для таблицы subscription_requests
 */

const fs = require('fs');
const path = require('path');

// Типы для subscription_requests
const subscriptionRequestsTypes = `
      subscription_requests: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          address: string
          social: string | null
          plan: string
          payment_method: string
          status: string
          notes: string | null
          screenshot: string | null
          admin_notes: string | null
          privacy_consent: boolean | null
          marketing_consent: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          address: string
          social?: string | null
          plan: string
          payment_method: string
          status?: string
          notes?: string | null
          screenshot?: string | null
          admin_notes?: string | null
          privacy_consent?: boolean | null
          marketing_consent?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          address?: string
          social?: string | null
          plan?: string
          payment_method?: string
          status?: string
          notes?: string | null
          screenshot?: string | null
          admin_notes?: string | null
          privacy_consent?: boolean | null
          marketing_consent?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }`;

async function updateDatabaseTypes() {
  try {
    console.log('🔄 Обновляем типы базы данных...');
    
    const typesPath = path.join(__dirname, 'src/lib/database.types.ts');
    let content = fs.readFileSync(typesPath, 'utf8');
    
    // Находим место для вставки subscription_requests
    const tablesStart = content.indexOf('Tables: {');
    const tablesEnd = content.indexOf('}', tablesStart);
    
    if (tablesStart === -1 || tablesEnd === -1) {
      console.error('❌ Не удалось найти секцию Tables в файле типов');
      return;
    }
    
    // Проверяем, есть ли уже subscription_requests
    if (content.includes('subscription_requests:')) {
      console.log('✅ Типы для subscription_requests уже существуют');
      return;
    }
    
    // Вставляем типы для subscription_requests
    const beforeTables = content.substring(0, tablesStart + 9);
    const afterTables = content.substring(tablesEnd);
    
    const newContent = beforeTables + '\n' + subscriptionRequestsTypes + '\n    ' + afterTables;
    
    // Создаем резервную копию
    const backupPath = typesPath + '.backup';
    fs.writeFileSync(backupPath, content);
    console.log('💾 Создана резервная копия:', backupPath);
    
    // Записываем обновленный файл
    fs.writeFileSync(typesPath, newContent);
    console.log('✅ Типы базы данных обновлены');
    
    // Проверяем синтаксис
    try {
      require('typescript').transpile(newContent);
      console.log('✅ Синтаксис TypeScript корректен');
    } catch (error) {
      console.warn('⚠️ Проблема с синтаксисом TypeScript:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Ошибка при обновлении типов:', error);
  }
}

if (require.main === module) {
  updateDatabaseTypes().catch(console.error);
}

module.exports = { updateDatabaseTypes };
