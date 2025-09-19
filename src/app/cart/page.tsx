'use client'

import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Trash2, ShoppingBag, Store, Truck, Info } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { logger } from '@/lib/logger'

export default function CartPage() {
  const { state, removeItem, updateItem, clearCart } = useCart()

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId)
    logger.info('Cart: Item removed from cart page', { itemId })
  }

  const handleUpdatePickupMethod = (itemId: string, method: 'store' | 'delivery') => {
    updateItem(itemId, { pickup_method: method })
    logger.info('Cart: Pickup method updated', { itemId, method })
  }

  const handleClearCart = () => {
    clearCart()
    logger.info('Cart: Cart cleared from cart page')
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-neutral-600">
              <li><Link href="/" className="hover:text-neutral-900">Головна</Link></li>
              <li>/</li>
              <li className="text-neutral-900">Корзина</li>
            </ol>
          </nav>

          {/* Empty Cart */}
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto h-24 w-24 text-neutral-300 mb-4" />
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">КОРЗИНА</h1>
            <p className="text-lg text-neutral-600 mb-8">Ваша корзина порожня</p>
            <Link href="/catalog">
              <Button size="lg" className="bg-neutral-800 hover:bg-neutral-900">
                Перейти до каталогу
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-neutral-600">
            <li><Link href="/" className="hover:text-neutral-900">Головна</Link></li>
            <li>/</li>
            <li className="text-neutral-900">Корзина</li>
          </ol>
        </nav>

        {/* Page Title */}
        <h1 className="text-4xl font-bold text-neutral-900 text-center mb-8">КОРЗИНА</h1>

        <div className="max-w-4xl mx-auto">
          {/* Cart Items */}
          <div className="space-y-6">
            {state.items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Book Cover */}
                    <div className="flex-shrink-0">
                      <div className="w-32 h-48 bg-neutral-200 rounded-lg overflow-hidden">
                        <Image
                          src={item.cover_url}
                          alt={item.title}
                          width={128}
                          height={192}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Book Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                            {item.title}
                          </h3>
                          <p className="text-neutral-600 mb-1">
                            <strong>Автор:</strong> {item.author}
                          </p>
                          <p className="text-neutral-600 mb-1">
                            <strong>Артикул:</strong> {item.article}
                          </p>
                          <p className="text-neutral-600">
                            <strong>Термін оренди:</strong> {item.rental_days} днів
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Pickup Method Selection */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-neutral-700 mb-2">Спосіб отримання:</p>
                        <div className="flex gap-4">
                          <Button
                            variant={item.pickup_method === 'store' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleUpdatePickupMethod(item.id, 'store')}
                            className="flex items-center gap-2"
                          >
                            <Store className="h-4 w-4" />
                            Самовивіз із магазину
                          </Button>
                          <Button
                            variant={item.pickup_method === 'delivery' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleUpdatePickupMethod(item.id, 'delivery')}
                            className="flex items-center gap-2"
                          >
                            <Truck className="h-4 w-4" />
                            Доставка
                          </Button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-2xl font-bold text-neutral-900">
                          {item.price} ₴
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cart Info */}
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-neutral-700">
                  Ви можете обрати до {state.maxItems} книг одночасно для оренди
                </p>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <Store className="h-5 w-5 text-green-600" />
                <p className="text-sm text-neutral-700">
                  Самовивіз із магазину
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-neutral-200 rounded-full h-2 mb-6">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(state.items.length / state.maxItems) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Cart Summary */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Підсумок</span>
                <span className="text-2xl font-bold">{state.totalPrice} ₴</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Кількість книг:</span>
                  <span>{state.totalItems}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Загальна сума:</span>
                  <span>{state.totalPrice} ₴</span>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <Button
                  variant="outline"
                  onClick={handleClearCart}
                  className="flex-1"
                >
                  Очистити корзину
                </Button>
                <Button
                  size="lg"
                  className="flex-1 bg-neutral-800 hover:bg-neutral-900"
                >
                  Оформити Підписку
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
