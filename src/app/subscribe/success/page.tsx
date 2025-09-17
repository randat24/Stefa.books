import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface SuccessPageProps {
  searchParams: {
    requestId?: string;
  };
}

export default function SubscribeSuccessPage({ searchParams }: SuccessPageProps) {
  const requestId = searchParams.requestId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Оплата успішна! 🎉
          </h1>
          
          <p className="text-gray-600 mb-6">
            Ваша підписка активована. Дякуємо за довіру!
          </p>

          {requestId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">
                ID заявки: <span className="font-mono text-gray-700">{requestId}</span>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/catalog">
                Переглянути каталог
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                На головну
              </Link>
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Якщо у вас виникли питання, звертайтесь до нашої служби підтримки
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
