'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Щось пішло не так</h1>
          <p>На жаль, сталася неочікувана помилка.</p>
          <button onClick={reset} style={{ padding: '0.5rem 1rem', margin: '1rem' }}>
            Спробувати знову
          </button>
        </div>
      </body>
    </html>
  );
}