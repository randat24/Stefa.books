import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Book } from '@/lib/supabase'

interface BookCacheState {
  // Кэшированные книги
  books: Book[]
  // Время последней синхронизации
  lastSync: number | null
  // Статус синхронизации
  isSyncing: boolean
  // Версия кэша для отслеживания изменений
  cacheVersion: string
  // Хеш данных для проверки изменений
  dataHash: string | null
  
  // Actions
  setBooks: (books: Book[]) => void
  addBook: (book: Book) => void
  updateBook: (id: string, updates: Partial<Book>) => void
  removeBook: (id: string) => void
  setLastSync: (timestamp: number) => void
  setIsSyncing: (syncing: boolean) => void
  updateCacheVersion: () => void
  setDataHash: (hash: string) => void
  clearCache: () => void
  
  // Getters
  getBookById: (id: string) => Book | undefined
  getBooksByCategory: (categoryId: string) => Book[]
  getBooksByAgeCategory: (ageCategoryId: string) => Book[]
  searchBooks: (query: string) => Book[]
  getAvailableBooks: () => Book[]
  getFilteredBooks: (filters: {
    categoryId?: string
    ageCategoryId?: string
    search?: string
    availableOnly?: boolean
    limit?: number
  }) => Book[]
  
  // Синхронизация
  syncWithServer: () => Promise<void>
  checkForUpdates: () => Promise<boolean>
}

// Функция для создания хеша данных
function createDataHash(books: Book[]): string {
  const sortedBooks = [...books].sort((a, b) => a.id.localeCompare(b.id))
  const dataString = JSON.stringify(sortedBooks)
  
  // Простая функция хеширования для строк с кириллицей
  let hash = 0
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).slice(0, 16) // 16-символьный хеш
}

export const useBooksStore = create<BookCacheState>()(
  persist(
    (set, get) => ({
      // Initial state
      books: [],
      lastSync: null,
      isSyncing: false,
      cacheVersion: '1.0.0',
      dataHash: null,
      
      // Actions
      setBooks: (books) => {
        const dataHash = createDataHash(books)
        set({ books, dataHash })
      },
      
      addBook: (book) => {
        const { books } = get()
        const newBooks = [...books, book]
        const dataHash = createDataHash(newBooks)
        set({ books: newBooks, dataHash })
      },
      
      updateBook: (id, updates) => {
        const { books } = get()
        const updatedBooks = books.map(book => 
          book.id === id ? { ...book, ...updates } : book
        )
        const dataHash = createDataHash(updatedBooks)
        set({ books: updatedBooks, dataHash })
      },
      
      removeBook: (id) => {
        const { books } = get()
        const filteredBooks = books.filter(book => book.id !== id)
        const dataHash = createDataHash(filteredBooks)
        set({ books: filteredBooks, dataHash })
      },
      
      setLastSync: (timestamp) => set({ lastSync: timestamp }),
      setIsSyncing: (syncing) => set({ isSyncing: syncing }),
      
      updateCacheVersion: () => {
        const { cacheVersion } = get()
        const [major, minor, patch] = cacheVersion.split('.').map(Number)
        const newVersion = `${major}.${minor}.${patch + 1}`
        set({ cacheVersion: newVersion })
      },
      
      setDataHash: (hash) => set({ dataHash: hash }),
      
      clearCache: () => set({ 
        books: [], 
        lastSync: null, 
        dataHash: null,
        cacheVersion: '1.0.0'
      }),
      
      // Getters
      getBookById: (id) => {
        const { books } = get()
        return books.find(book => book.id === id)
      },
      
      getBooksByCategory: (categoryId) => {
        const { books } = get()
        return books.filter(book => book.category === categoryId)
      },
      
      getBooksByAgeCategory: (ageCategoryId) => {
        const { books } = get()
        return books.filter(book => book.age_range === ageCategoryId)
      },
      
      searchBooks: (query) => {
        const { books } = get()
        const lowerQuery = query.toLowerCase()
        return books.filter(book => 
          book.title.toLowerCase().includes(lowerQuery) ||
          book.author.toLowerCase().includes(lowerQuery) ||
          book.description?.toLowerCase().includes(lowerQuery)
        )
      },
      
      getAvailableBooks: () => {
        const { books } = get()
        return books.filter(book => book.available)
      },
      
      getFilteredBooks: (filters) => {
        const { books } = get()
        let filteredBooks = [...books]
        
        if (filters.categoryId) {
          filteredBooks = filteredBooks.filter(book => book.category === filters.categoryId)
        }
        
        if (filters.ageCategoryId) {
          filteredBooks = filteredBooks.filter(book => book.age_range === filters.ageCategoryId)
        }
        
        if (filters.search) {
          const lowerQuery = filters.search.toLowerCase()
          filteredBooks = filteredBooks.filter(book => 
            book.title.toLowerCase().includes(lowerQuery) ||
            book.author.toLowerCase().includes(lowerQuery) ||
            book.description?.toLowerCase().includes(lowerQuery)
          )
        }
        
        if (filters.availableOnly) {
          filteredBooks = filteredBooks.filter(book => book.available)
        }
        
        if (filters.limit) {
          filteredBooks = filteredBooks.slice(0, filters.limit)
        }
        
        return filteredBooks
      },
      
      // Синхронизация с сервером
      syncWithServer: async () => {
        const { setIsSyncing, setBooks, setLastSync, updateCacheVersion } = get()
        
        try {
          setIsSyncing(true)
          console.log('🔄 Starting books synchronization...')
          
          // Получаем все книги с сервера
          const response = await fetch('/api/books?limit=10000')
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          const result = await response.json()
          if (!result.success) {
            throw new Error(result.error || 'Ошибка синхронизации')
          }
          
          // Обновляем кэш
          setBooks(result.data)
          setLastSync(Date.now())
          updateCacheVersion()
          
          console.log(`✅ Synchronized ${result.data.length} books`)
          
        } catch (error) {
          console.error('❌ Sync error:', error)
          throw error
        } finally {
          setIsSyncing(false)
        }
      },
      
      // Проверка обновлений
      checkForUpdates: async () => {
        const { books, dataHash } = get()
        
        try {
          // Получаем хеш данных с сервера
          const response = await fetch('/api/books/hash')
          if (!response.ok) return false
          
          const { hash: serverHash } = await response.json()
          
          // Сравниваем хеши
          if (serverHash !== dataHash) {
            console.log('🔄 Data changed, sync needed')
            return true
          }
          
          return false
        } catch (error) {
          console.error('❌ Error checking updates:', error)
          return false
        }
      }
    }),
    {
      name: 'books-cache',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        books: state.books,
        lastSync: state.lastSync,
        cacheVersion: state.cacheVersion,
        dataHash: state.dataHash
      })
    }
  )
)
