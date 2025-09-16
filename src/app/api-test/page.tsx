'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/lib/hooks/useSupabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

export default function ApiTestPage() {
  const { supabase, isLoading: clientLoading } = useSupabase();
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const tests = [
    {
      id: 'categories',
      name: 'Тест категорий',
      action: async () => {
        if (!supabase) throw new Error('Supabase клиент не инициализирован');
        
        return await supabase
          .from('categories')
          .select('slug, updated_at')
          .eq('active', true);
      }
    },
    {
      id: 'books',
      name: 'Тест книг',
      action: async () => {
        if (!supabase) throw new Error('Supabase клиент не инициализирован');
        
        return await supabase
          .from('books')
          .select('id, updated_at')
          .eq('available', true)
          .order('updated_at', { ascending: false });
      }
    },
    {
      id: 'users',
      name: 'Тест пользователей',
      action: async () => {
        if (!supabase) throw new Error('Supabase клиент не инициализирован');
        
        // Этот запрос может требовать авторизации
        return await supabase
          .from('users')
          .select('subscription_type, status, subscription_status')
          .limit(1);
      }
    }
  ];

  const runTest = async (testId: string, action: () => Promise<any>) => {
    try {
      setLoading(prev => ({ ...prev, [testId]: true }));
      setErrors(prev => ({ ...prev, [testId]: '' }));
      
      const result = await action();
      console.log(`Test ${testId} result:`, result);
      
      setResults(prev => ({
        ...prev,
        [testId]: result
      }));
    } catch (err) {
      console.error(`Test ${testId} error:`, err);
      setErrors(prev => ({
        ...prev,
        [testId]: err instanceof Error ? err.message : 'Неизвестная ошибка'
      }));
    } finally {
      setLoading(prev => ({ ...prev, [testId]: false }));
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Тестирование API запросов</h1>
      
      {clientLoading ? (
        <div className="flex justify-center p-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tests.map(test => (
            <Card key={test.id} className="overflow-hidden">
              <CardHeader className="bg-neutral-50">
                <CardTitle className="text-xl">{test.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <Button 
                    onClick={() => runTest(test.id, test.action)}
                    disabled={loading[test.id]}
                  >
                    {loading[test.id] ? (
                      <>
                        <Spinner className="mr-2" size="sm" />
                        Выполняется...
                      </>
                    ) : 'Запустить тест'}
                  </Button>
                </div>
                
                {errors[test.id] && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
                    <strong>Ошибка:</strong> {errors[test.id]}
                  </div>
                )}
                
                {results[test.id] && (
                  <div>
                    <h3 className="font-medium mb-2">Результат:</h3>
                    <div className="bg-neutral-50 p-3 rounded-md overflow-x-auto">
                      <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(results[test.id], null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
