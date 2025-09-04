"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Щось пішло не так
          </h1>
          <p className="text-gray-600">
            На жаль, сталася неочікувана помилка при завантаженні сторінки.
          </p>
        </div>

        {/* Error details in development */}
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Деталі помилки
            </summary>
            <div className="mt-2 p-3 bg-red-50 rounded-lg">
              <p className="text-xs text-red-600 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-gray-500 mt-2">
                  ID помилки: {error.digest}
                </p>
              )}
            </div>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} size="lg">
            <RefreshCw size={16} className="mr-2" />
            Спробувати знову
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'} 
            size="lg"
          >
            <Home size={16} className="mr-2" />
            На головну
          </Button>
        </div>
      </div>
    </div>
  );
}