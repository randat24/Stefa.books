"use client";
import { useState } from "react";

const QA = [
  {
    q: "Де працює Stefa.books та як забрати книги?",
    a: "Ми працюємо в Миколаєві. Забрати книги можна у нашому партнерському кафе за адресою: вул. Маріупольська 13/2. Доставка не здійснюється — лише самовивіз."
  },
  {
    q: "Скільки коштують тарифи підписки?",
    a: "У нас 3 тарифи: Mini (300 грн/міс) — 1 книга, Maxi (500 грн/міс) — 2 книги, Premium (2500 грн за півроку) — 2 книги з економією 500 грн."
  },
  {
    q: "Як оплатити підписку?",
    a: "Оплата здійснюється на рахунок ФОП. Переказ на карту Monobank або готівка при отриманні. Реквізити карти показуються у формі підписки. При переказі потрібно надіслати скриншот."
  },
  {
    q: "Який термін дії підписки?",
    a: "Підписка діє протягом місяця. Змінювати книги можна декілька раз, без обмежень. Для Premium тарифу термін дії - 6 місяців."
  },
  {
    q: "Чи потрібна застава за книги?",
    a: "Застава не потрібна. Але у разі втрати або значного пошкодження книги, потрібно компенсувати її вартість (максимум 500 грн за книгу)."
  },
  {
    q: "Які книги є в каталозі?",
    a: "Наш каталог налічує багато книг різних жанрів. Ми постійно оновлюємо асортимент книгарні."
  },
  {
    q: "Що робити, якщо потрібної книги немає?",
    a: "Напишіть нам — ми спробуємо знайти та додати книгу до каталогу. Також можна слідкувати за оновленнями через наш сайт."
  },
  {
    q: "Як скасувати підписку?",
    a: "Підписку можна скасувати у будь-який час, зв'язавшись з нами. Повернення коштів можливе протягом 14 днів з моменту оплати згідно із законом про захист прав споживачів."
  }
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0); // First item open by default
  return (
    <section className="section">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-h1 text-neutral-900 mb-4">Часті питання про оренду дитячих книг</h2>
          <p className="text-body-lg text-neutral-600 max-w-2xl mx-auto">Відповіді на найпоширеніші питання про підписку на дитячі книги, оренду та доставку в Миколаєві. Отримайте всю необхідну інформацію.</p>
        </div>

        <div className="grid gap-3 max-w-3xl mx-auto">
          {QA.map((item, i) => {
            const active = open === i;
            return (
              <div key={i} className="card-soft">
                <button
                  className="w-full text-left px-5 py-4 font-medium flex items-center justify-between text-accent hover:bg-surface-2 transition-colors rounded-lg"
                  onClick={() => setOpen(active ? null : i)}
                  aria-expanded={active}
                >
                  {item.q}
                  <span className={`transition-transform text-2xl ${active ? "rotate-45" : ""}`}>+</span>
                </button>
                {active && (
                  <div className="px-5 pb-5 text-text-muted leading-relaxed">{item.a}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}