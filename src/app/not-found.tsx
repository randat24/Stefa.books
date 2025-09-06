export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          404 - Сторінка не знайдена
        </h1>
        <p className="text-gray-600">
          На жаль, сторінка, яку ви шукаєте, не існує.
        </p>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a 
          href="/" 
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          На головну
        </a>
      </div>
    </div>
  );
}