// Скрипт для создания администратора через API
// Запустите в браузере на странице вашего сайта

async function createAdmin() {
  try {
    const response = await fetch('/api/admin/create-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@stefa-books.com.ua',
        password: 'Admin123!@#',
        name: 'Администратор'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Администратор создан успешно!');
      console.log('Данные:', result.data);
    } else {
      console.error('❌ Ошибка:', result.error);
    }
  } catch (error) {
    console.error('❌ Ошибка сети:', error);
  }
}

// Запустить создание
createAdmin();
