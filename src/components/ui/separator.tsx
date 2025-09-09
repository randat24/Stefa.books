import React from 'react';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Separator({ 
  orientation = 'horizontal', 
  className = '' 
}: SeparatorProps) {
  const baseClasses = 'bg-neutral-200';
  const orientationClasses = orientation === 'horizontal' 
    ? 'h-px w-full my-4' 
    : 'w-px h-full mx-4';
  
  return (
    <div 
      className={`${baseClasses} ${orientationClasses} ${className}`}
      role="separator"
    />
  );
}