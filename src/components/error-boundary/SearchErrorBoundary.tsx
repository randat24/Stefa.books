"use client";

import React from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchErrorFallbackProps {
  resetError: () => void;
}

function SearchErrorFallback({ resetError }: SearchErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
        <Search className="w-6 h-6 text-yellow-600" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">
          Помилка пошуку
        </h3>
        <p className="text-gray-600 max-w-md">
          На жаль, не вдалося завантажити результати пошуку. 
          Спробуйте оновити або змініть пошуковий запит.
        </p>
      </div>

      <Button onClick={resetError} size="lg">
        <RefreshCw size={16} className="mr-2" />
        Спробувати знову
      </Button>
    </div>
  );
}

interface SearchErrorBoundaryProps {
  children: React.ReactNode;
}

export function SearchErrorBoundary({ children }: SearchErrorBoundaryProps) {
  return (
    <ErrorBoundary 
      fallback={<SearchErrorFallback resetError={() => window.location.reload()} />}
      onError={(error) => {
        console.error('Search error:', error);
        // Here you could send to analytics or error tracking service
      }}
    >
      {children}
    </ErrorBoundary>
  );
}