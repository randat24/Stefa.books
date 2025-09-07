'use client';

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h1>Щось пішло не так</h1>
      <p>На жаль, сталася неочікувана помилка.</p>
      <button onClick={reset}>Спробувати знову</button>
    </div>
  );
}