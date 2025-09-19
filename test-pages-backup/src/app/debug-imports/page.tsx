'use client';

import BookCardDefault, { BookCard as BookCardNamed } from '@/components/BookCard';

export default function DebugImportsPage() {
  console.log('BookCardDefault:', BookCardDefault);
  console.log('BookCardNamed:', BookCardNamed);
  console.log('Type of BookCardDefault:', typeof BookCardDefault);
  console.log('Type of BookCardNamed:', typeof BookCardNamed);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Debug Imports</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">BookCardDefault</h2>
          <pre>{JSON.stringify(BookCardDefault, null, 2)}</pre>
        </div>
        <div>
          <h2 className="text-xl font-semibold">BookCardNamed</h2>
          <pre>{JSON.stringify(BookCardNamed, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}