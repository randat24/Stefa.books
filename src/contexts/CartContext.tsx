'use client'

import { createContext, useContext, useReducer, ReactNode } from 'react'
import { logger } from '@/lib/logger'

export interface CartItem {
  id: string
  title: string
  author: string
  article: string
  cover_url: string
  rental_days: number
  price: number
  pickup_method: 'store' | 'delivery'
}

interface CartState {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  maxItems: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<CartItem> } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_MAX_ITEMS'; payload: number }

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  maxItems: 2 // По умолчанию можно арендовать до 2 книг
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Проверяем лимит книг
      if (state.items.length >= state.maxItems) {
        logger.warn('Cart: Cannot add more items, limit reached', {
          currentItems: state.items.length,
          maxItems: state.maxItems
        })
        return state
      }

      // Проверяем, не добавлена ли уже эта книга
      const existingItem = state.items.find(item => item.id === action.payload.id)
      if (existingItem) {
        logger.warn('Cart: Item already exists', { itemId: action.payload.id })
        return state
      }

      const newItems = [...state.items, action.payload]
      const totalPrice = newItems.reduce((sum, item) => sum + item.price, 0)

      logger.info('Cart: Item added', {
        itemId: action.payload.id,
        totalItems: newItems.length,
        totalPrice
      })

      return {
        ...state,
        items: newItems,
        totalItems: newItems.length,
        totalPrice
      }
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload)
      const totalPrice = newItems.reduce((sum, item) => sum + item.price, 0)

      logger.info('Cart: Item removed', {
        itemId: action.payload,
        remainingItems: newItems.length
      })

      return {
        ...state,
        items: newItems,
        totalItems: newItems.length,
        totalPrice
      }
    }

    case 'UPDATE_ITEM': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, ...action.payload.updates }
          : item
      )
      const totalPrice = newItems.reduce((sum, item) => sum + item.price, 0)

      return {
        ...state,
        items: newItems,
        totalPrice
      }
    }

    case 'CLEAR_CART': {
      logger.info('Cart: Cleared')
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0
      }
    }

    case 'SET_MAX_ITEMS': {
      return {
        ...state,
        maxItems: action.payload
      }
    }

    default:
      return state
  }
}

interface CartContextType {
  state: CartState
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateItem: (id: string, updates: Partial<CartItem>) => void
  clearCart: () => void
  setMaxItems: (max: number) => void
  canAddItem: () => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const addItem = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
  }

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }

  const updateItem = (id: string, updates: Partial<CartItem>) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { id, updates } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const setMaxItems = (max: number) => {
    dispatch({ type: 'SET_MAX_ITEMS', payload: max })
  }

  const canAddItem = () => {
    return state.items.length < state.maxItems
  }

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateItem,
        clearCart,
        setMaxItems,
        canAddItem
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
