import type { Metadata } from 'next'
// import { AdminGuard } from '@/components/auth/AdminGuard' // ВРЕМЕННО отключен

export const metadata: Metadata = {
  title: 'Адмін-панель - Stefa.books',
  description: 'Управління бібліотекою дитячих книг',
}

// Принудительно отключаем статическую генерацию для админ-панели
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ВРЕМЕННО: Убрана защита AdminGuard для тестирования
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}