# Хуки для работы с Supabase

## useSupabase

Хук `useSupabase` предназначен для корректной работы с Supabase API, автоматически добавляя необходимые заголовки для аутентификации и авторизации.

### Проблема

В приложении возникали ошибки 400 Bad Request при обращении к Supabase API, связанные с отсутствием или некорректной установкой заголовков, необходимых для авторизации (`apikey` и `Authorization`).

### Решение

Хук `useSupabase` инициализирует клиент Supabase с правильными заголовками и управляет его жизненным циклом.

### Использование

```tsx
'use client';

import { useSupabase } from '@/lib/hooks/useSupabase';

export function MyComponent() {
  const { supabase, isLoading, error } = useSupabase();
  
  // Дождитесь инициализации клиента
  if (isLoading) {
    return <div>Загрузка...</div>;
  }
  
  // Обработайте ошибки
  if (error) {
    return <div>Ошибка: {error.message}</div>;
  }
  
  // Используйте клиент Supabase с правильными заголовками
  const handleFetchData = async () => {
    const { data, error } = await supabase
      .from('your_table')
      .select('*');
    
    // Обработка данных...
  };
  
  return (
    // JSX компонента
  );
}
```

### Возвращаемые значения

- `supabase`: Инициализированный клиент Supabase с правильными заголовками
- `isLoading`: Флаг, указывающий на процесс инициализации клиента
- `error`: Объект ошибки, если инициализация не удалась

### Важные моменты

1. Хук автоматически добавляет заголовок `apikey` со значением из переменной окружения `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. Если в localStorage найден токен, хук автоматически добавляет заголовок `Authorization` со значением `Bearer ${token}`

3. Хук настраивает клиента на автоматическое обновление токена при необходимости

### Middleware

В дополнение к хуку, в приложении добавлен middleware (`src/middleware.ts`), который автоматически добавляет необходимые заголовки к API запросам:

```tsx
export function middleware(request: NextRequest) {
  if (url.pathname.includes('/api/') && !url.pathname.startsWith('/api/admin/')) {
    // Добавление заголовков apikey и Authorization
  }
}
```

## Рекомендации по использованию

1. В серверных компонентах используйте стандартный клиент Supabase с сервисным ключом

2. В клиентских компонентах всегда используйте хук `useSupabase` вместо прямого импорта из `@/lib/supabase`

3. При необходимости кастомной обработки ошибок аутентификации, используйте проверку через `error?.status === 401`

4. При отладке проблем с API проверяйте заголовки запросов через вкладку Network в инструментах разработчика

## Примеры использования

### Получение данных из таблицы

```tsx
const { supabase } = useSupabase();

const fetchBooks = async () => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('available', true);
    
  if (error) {
    console.error('Error fetching books:', error);
    return;
  }
  
  setBooks(data);
};
```

### Добавление данных в таблицу

```tsx
const { supabase } = useSupabase();

const addBook = async (book) => {
  const { data, error } = await supabase
    .from('books')
    .insert([book])
    .select();
    
  if (error) {
    console.error('Error adding book:', error);
    return;
  }
  
  // Обработка успешного добавления
};
```
