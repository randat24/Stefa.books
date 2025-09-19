'use client'

import { useCart } from '@/contexts/CartContext'
import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export default function CartIcon() {
  const { state } = useCart()

  return (
    <Link href="/cart" className="relative">
      <div className="relative p-2 hover:bg-neutral-100 rounded-lg transition-colors">
        <ShoppingBag className="h-6 w-6 text-neutral-700" />
        {state.totalItems > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px]"
          >
            {state.totalItems}
          </Badge>
        )}
      </div>
    </Link>
  )
}
