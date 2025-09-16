'use client';

import { cn } from '@/lib/cn';

interface AgeCategoryBadgeProps {
  ageRange?: string;
  ageCategoryName?: string;
  minAge?: number;
  maxAge?: number;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

export function AgeCategoryBadge({ 
  ageRange, 
  ageCategoryName, 
  minAge, 
  maxAge,
  className = '',
  variant = 'default'
}: AgeCategoryBadgeProps) {
  // Determine display text and color
  const getDisplayInfo = () => {
    if (ageCategoryName) {
      return {
        text: ageCategoryName,
        color: getAgeCategoryColor(ageCategoryName)
      };
    }
    
    if (ageRange) {
      return {
        text: ageRange,
        color: getAgeRangeColor(ageRange)
      };
    }
    
    if (minAge !== undefined && maxAge !== undefined) {
      const rangeText = minAge === maxAge ? `${minAge}` : `${minAge}-${maxAge}`;
      return {
        text: rangeText,
        color: getAgeRangeColor(rangeText)
      };
    }
    
    return {
      text: 'Всі віки',
      color: 'bg-neutral-100 text-neutral-600'
    };
  };

  const { text, color } = getDisplayInfo();

  if (variant === 'compact') {
    return (
      <span 
        className={cn(
          'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
          color,
          className
        )}
        title={ageCategoryName || `Вікова категорія: ${text}`}
      >
        {text}
      </span>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span 
          className={cn(
            'inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium',
            color
          )}
        >
          {text}
        </span>
        {ageCategoryName && ageCategoryName !== text && (
          <span className="text-sm text-neutral-500">
            {ageCategoryName}
          </span>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <span 
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold',
        color,
        className
      )}
      title={ageCategoryName || `Вікова категорія: ${text}`}
    >
      {text}
    </span>
  );
}

function getAgeCategoryColor(categoryName: string): string {
  const name = categoryName.toLowerCase();
  
  if (name.includes('найменші') || name.includes('0-2')) {
    return 'bg-pink-100 text-pink-700 border border-pink-200';
  }
  if (name.includes('дошкільний') || name.includes('3-5')) {
    return 'bg-purple-100 text-purple-700 border border-purple-200';
  }
  if (name.includes('молодший') || name.includes('6-8')) {
    return 'bg-blue-100 text-blue-700 border border-blue-200';
  }
  if (name.includes('середній') || name.includes('9-12')) {
    return 'bg-green-100 text-green-700 border border-green-200';
  }
  if (name.includes('підлітковий') || name.includes('13-16')) {
    return 'bg-orange-100 text-orange-700 border border-orange-200';
  }
  if (name.includes('дорослі') || name.includes('17+')) {
    return 'bg-red-100 text-red-700 border border-red-200';
  }
  if (name.includes('всі віки')) {
    return 'bg-neutral-100 text-neutral-600 border border-neutral-200';
  }
  
  return 'bg-gray-100 text-gray-600 border border-gray-200';
}

function getAgeRangeColor(ageRange: string): string {
  const range = ageRange.toLowerCase();
  
  if (range.includes('0-2') || range === '0' || range === '1' || range === '2') {
    return 'bg-pink-100 text-pink-700 border border-pink-200';
  }
  if (range.includes('3-5') || range === '3' || range === '4' || range === '5') {
    return 'bg-purple-100 text-purple-700 border border-purple-200';
  }
  if (range.includes('6-8') || range === '6' || range === '7' || range === '8') {
    return 'bg-blue-100 text-blue-700 border border-blue-200';
  }
  if (range.includes('9-12') || range === '9' || range === '10' || range === '11' || range === '12') {
    return 'bg-green-100 text-green-700 border border-green-200';
  }
  if (range.includes('13-16') || range === '13' || range === '14' || range === '15' || range === '16') {
    return 'bg-orange-100 text-orange-700 border border-orange-200';
  }
  if (range.includes('17+') || range === '17' || range === '18' || range === '19') {
    return 'bg-red-100 text-red-700 border border-red-200';
  }
  
  return 'bg-gray-100 text-gray-600 border border-gray-200';
}
