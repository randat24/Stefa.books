"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/cn";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

export function Breadcrumbs({ 
  items, 
  className,
  showHome = true 
}: BreadcrumbsProps) {
  const allItems = showHome 
    ? [{ label: "Головна", href: "/" }, ...items]
    : items;

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}
    >
      <ol className="flex items-center space-x-1">
        {allItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/60" />
            )}
            {item.href && !item.current ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors duration-200 hover:underline"
                aria-label={`Перейти до ${item.label}`}
              >
                {item.label}
              </Link>
            ) : (
              <span 
                className={cn(
                  "font-medium",
                  item.current ? "text-foreground" : "text-muted-foreground"
                )}
                aria-current={item.current ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Утилита для создания breadcrumbs для страницы книги
export function createBookBreadcrumbs(book: {
  title: string;
  category?: string;
  category_slug?: string;
}) {
  const items: BreadcrumbItem[] = [
    { label: "Каталог", href: "/catalog" }
  ];

  if (book.category && book.category_slug) {
    items.push({
      label: book.category,
      href: `/catalog/${book.category_slug}`
    });
  }

  items.push({
    label: book.title,
    current: true
  });

  return items;
}

// Утилита для создания breadcrumbs для категории
export function createCategoryBreadcrumbs(category: {
  name: string;
  parent?: {
    name: string;
    slug: string;
  };
}) {
  const items: BreadcrumbItem[] = [
    { label: "Каталог", href: "/catalog" }
  ];

  if (category.parent) {
    items.push({
      label: category.parent.name,
      href: `/catalog/${category.parent.slug}`
    });
  }

  items.push({
    label: category.name,
    current: true
  });

  return items;
}

// Утилита для создания breadcrumbs для поиска
export function createSearchBreadcrumbs(query: string) {
  return [
    { label: "Каталог", href: "/catalog" },
    { label: `Пошук: "${query}"`, current: true }
  ];
}
