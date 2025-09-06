'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Щось пішло не так
        </h1>
        <p className="text-gray-600">
          На жаль, сталася неочікувана помилка.
        </p>
        <button 
          onClick={reset}
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Спробувати знову
        </button>
      </div>
    </div>
  );
}