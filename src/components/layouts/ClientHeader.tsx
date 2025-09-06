'use client';

import { Header } from './Header';

/**
 * Клиентский компонент Header, который рендерится только на клиенте
 * Предотвращает ошибки useContext во время статической генерации
 */
export function ClientHeader() {
  return <Header />;
}
