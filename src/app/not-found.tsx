// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div>
      <h1>404 - Сторінка не знайдена</h1>
      <p>На жаль, сторінка, яку ви шукаєте, не існує.</p>
      <a href="/">На головну</a>
    </div>
  );
}