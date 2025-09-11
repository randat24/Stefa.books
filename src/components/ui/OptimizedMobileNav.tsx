'use client'

import { memo, useCallback, useState, useEffect, useRef } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import PerformanceButton from './PerformanceButton'

interface NavItem {
  label: string
  href: string
  children?: NavItem[]
  icon?: React.ReactNode
}

interface OptimizedMobileNavProps {
  items: NavItem[]
  className?: string
  onItemClick?: (href: string) => void
}

const OptimizedMobileNav = memo(function OptimizedMobileNav({
  items,
  className = '',
  onItemClick,
}: OptimizedMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const handleItemClick = useCallback((href: string) => {
    setIsOpen(false)
    setActiveSubmenu(null)
    onItemClick?.(href)
  }, [onItemClick])

  const handleSubmenuToggle = useCallback((label: string) => {
    setActiveSubmenu(prev => prev === label ? null : label)
  }, [])

  // Закрытие при клике вне навигации
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navRef.current &&
        !navRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setActiveSubmenu(null)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Блокировка скролла при открытом меню
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Обработка клавиши Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        setActiveSubmenu(null)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const renderNavItem = (item: NavItem, index: number) => {
    const hasChildren = item.children && item.children.length > 0
    const isSubmenuOpen = activeSubmenu === item.label

    return (
      <div key={index} className="border-b border-neutral-200 last:border-b-0">
        {hasChildren ? (
          <div>
            <button
              onClick={() => handleSubmenuToggle(item.label)}
              className="w-full flex items-center justify-between px-4 py-3 text-left text-neutral-700 hover:bg-neutral-50 transition-colors"
              aria-expanded={isSubmenuOpen}
              aria-controls={`submenu-${index}`}
            >
              <div className="flex items-center gap-3">
                {item.icon && (
                  <span className="text-neutral-500">{item.icon}</span>
                )}
                <span className="font-medium">{item.label}</span>
              </div>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-neutral-400 transition-transform',
                  isSubmenuOpen && 'rotate-180'
                )}
              />
            </button>
            
            {isSubmenuOpen && (
              <div
                id={`submenu-${index}`}
                className="bg-neutral-50 border-t border-neutral-200"
              >
                {item.children!.map((child, childIndex) => (
                  <button
                    key={childIndex}
                    onClick={() => handleItemClick(child.href)}
                    className="w-full flex items-center gap-3 px-8 py-3 text-left text-neutral-600 hover:bg-neutral-100 transition-colors"
                  >
                    {child.icon && (
                      <span className="text-neutral-400">{child.icon}</span>
                    )}
                    <span>{child.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => handleItemClick(item.href)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            {item.icon && (
              <span className="text-neutral-500">{item.icon}</span>
            )}
            <span className="font-medium">{item.label}</span>
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* Кнопка меню */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
        aria-label={isOpen ? 'Закрити меню' : 'Відкрити меню'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Мобильное меню */}
      {isOpen && (
        <div
          ref={navRef}
          className="fixed inset-0 z-50 bg-white"
          role="navigation"
          aria-label="Мобільна навігація"
        >
          {/* Заголовок */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
            <h2 className="text-body-lg font-semibold text-neutral-900">Меню</h2>
            <PerformanceButton
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              className="p-2"
              aria-label="Закрити меню"
            >
              <X className="w-5 h-5" />
            </PerformanceButton>
          </div>

          {/* Навигационные элементы */}
          <div className="overflow-y-auto h-full pb-20">
            {items.map((item, index) => renderNavItem(item, index))}
          </div>
        </div>
      )}
    </div>
  )
})

export default OptimizedMobileNav
