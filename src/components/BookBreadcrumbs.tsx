'use client';

import { Breadcrumbs, createBookBreadcrumbs } from '@/components/ui/Breadcrumbs';

interface BookBreadcrumbsProps {
  title: string;
  category?: string;
  category_slug?: string;
}

export function BookBreadcrumbs({ title, category, category_slug }: BookBreadcrumbsProps) {
  const breadcrumbItems = createBookBreadcrumbs({
    title,
    category,
    category_slug
  });

  return (
    <div className="container mx-auto px-4 py-4">
      <Breadcrumbs items={breadcrumbItems} />
    </div>
  );
}
