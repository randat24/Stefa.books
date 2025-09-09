"use client";

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { UserFacingError } from '@/lib/error-handler';

interface ErrorDisplayProps {
  error: UserFacingError;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
}

export function ErrorDisplay({ 
  error, 
  onRetry, 
  onGoHome,
  className = ''
}: ErrorDisplayProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className={`max-w-md w-full space-y-6 text-center ${className}`}>
      <div className="mx-auto w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-h3 text-neutral-900">
          {error.userMessage}
        </h3>
        
        {error.action && (
          <p className="text-neutral-600">
            Рекомендована дія: {error.action}
          </p>
        )}
      </div>

      {/* Error details in development */}
      {process.env.NODE_ENV === 'development' && (
        <details className="text-left">
          <summary className="cursor-pointer text-body-sm text-neutral-500 hover:text-neutral-700">
            Технічні деталі
          </summary>
          <div className="mt-2 p-3 bg-red-50 rounded-lg">
            <p className="text-caption text-red-600 font-mono break-all">
              {error.message}
            </p>
            <p className="text-caption text-neutral-500 mt-1">
              ID: {error.id}
            </p>
            <p className="text-caption text-neutral-500 mt-1">
              Категорія: {error.category} | Рівень: {error.severity}
            </p>
          </div>
        </details>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={handleRetry} size="lg">
          <RefreshCw size={16} className="mr-2" />
          Спробувати знову
        </Button>
        <Button variant="outline" onClick={handleGoHome} size="lg">
          <Home size={16} className="mr-2" />
          На головну
        </Button>
      </div>
    </div>
  );
}

export default ErrorDisplay;