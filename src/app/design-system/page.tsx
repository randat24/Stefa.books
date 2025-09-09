import { Fragment } from "react";

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text)]">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--surface)]/80 backdrop-blur supports-[backdrop-filter]:bg-[var(--surface)]/70">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-[var(--brand)] ring-1 ring-black/5" />
            <div>
              <div className="h3">Stefa.Books — Style Guide</div>
              <div className="small">Светлая тема · v1.0</div>
            </div>
          </div>
          <a className="btn btn-primary btn-sm" href="#typography">К типографике</a>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-10 space-y-10">
        {/* Quick intro */}
        <section className="card p-6 md:p-8">
          <h1 className="display mb-3">Единая система стилей</h1>
          <p className="lead measure">
            Страница служит эталоном визуальных правил: токены цвета, аккуратная типографика, кнопки, поля формы, уведомления и состояния загрузки. Все значения можно использовать как дизайн‑токены через CSS‑переменные.
          </p>
        </section>

        {/* Colors */}
        <section>
          <header className="mb-4">
            <h2 className="h2">Цветовая палитра</h2>
            <p className="small">Бренд, акценты, нейтрали и семантика. Контраст проверяется на фоне surface.</p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { name: "Brand", varName: "--brand" },
              { name: "Brand/600", varName: "--brand-600" },
              { name: "Accent", varName: "--accent" },
              { name: "Accent/700", varName: "--accent-700" },
              { name: "Text", varName: "--text" },
              { name: "Muted", varName: "--text-muted" },
              { name: "Line", varName: "--line" },
              { name: "Surface", varName: "--surface" },
              { name: "Success", varName: "--success" },
              { name: "Warning", varName: "--warning" },
              { name: "Error", varName: "--error" },
              { name: "Info", varName: "--info" },
            ].map((c) => (
              <div key={c.name} className="card overflow-hidden">
                <div
                  className="h-24 w-full"
                  style={{ background: `var(${c.varName})` }}
                />
                <div className="p-4 flex items-center justify-between">
                  <div className="h3">{c.name}</div>
                  <code className="mono small">var({c.varName})</code>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section id="typography">
          <header className="mb-4">
            <h2 className="h2">Профессиональная типографика</h2>
            <p className="small">Баланс читаемости: флюидная шкала, ограничение ширины строки, контраст и вертикальный ритм.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-6 space-y-4">
              <div className="display">Display — главный заголовок</div>
              <div className="h1">H1 — основной заголовок</div>
              <div className="h2">H2 — заголовок секции</div>
              <div className="h3">H3 — подзаголовок / метка</div>
              <p className="lead measure">Ведущий абзац. Используйте для вступлений и подзаголовков разделов.</p>
              <p className="body measure">
                Основной текст настроен для комфортного чтения: ширина строки ограничена <span className="mono">var(--measure)</span>.
              </p>
              <p className="small measure">Подпись/пояснение. Подходит для второстепенных описаний.</p>
            </div>

            <div className="card p-6 space-y-5">
              <div>
                <div className="h3 mb-2">Правила набора</div>
                <ul className="list-disc pl-5 small space-y-2 text-[var(--text-muted)]">
                  <li>Ширина текстовых блоков — не более <span className="mono">68ch</span>.</li>
                  <li>Заголовки с <span className="mono">text-wrap: balance</span>.</li>
                  <li>Единый межстрочный интервал: текст <span className="mono">1.65</span>.</li>
                  <li>Числа в таблицах — моноширинным шрифтом.</li>
                </ul>
              </div>
            </div>

            <div className="card p-6 space-y-4">
              <div className="h3">Технические детали</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 small">
                <div className="card-soft p-4">
                  <div className="h3 mb-1">Шрифты</div>
                  <div>UI & Headings — SF Pro<br/>Fallback — system-ui</div>
                </div>
                <div className="card-soft p-4">
                  <div className="h3 mb-1">Контраст</div>
                  <div>Текст 14–16px на фоне surface</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section>
          <header className="mb-4">
            <h2 className="h2">Кнопки</h2>
            <p className="small">Чёткая иерархия: Primary → Secondary → Outline → Ghost.</p>
          </header>
          <div className="card p-6 space-y-4">
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-primary btn-md">Primary</button>
              <button className="btn btn-secondary btn-md">Secondary</button>
              <button className="btn btn-outline btn-md">Outline</button>
              <button className="btn btn-ghost btn-md">Ghost</button>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-primary btn-sm">Маленькая</button>
              <button className="btn btn-primary btn-md">Средняя</button>
              <button className="btn btn-primary btn-lg">Большая</button>
            </div>
          </div>
        </section>

        {/* Forms */}
        <section>
          <header className="mb-4">
            <h2 className="h2">Формы</h2>
            <p className="small">Поле ввода, подсказки, ошибки/успех.</p>
          </header>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <form className="card p-6 space-y-4">
              <label className="label" htmlFor="name">Ім'я та прізвище *</label>
              <input id="name" className="field" placeholder="Іван Іванов" />
              <p className="help">Як у документі.</p>

              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" className="field" placeholder="you@example.com" />

              <button type="submit" className="btn btn-primary btn-xl btn-block">Оформити підписку</button>
            </form>

            <div className="space-y-6">
              <div className="card p-6 space-y-3">
                <div className="h3">Состояния полей</div>
                <input className="field is-success" placeholder="Успешное поле" />
                <p className="help">Всё ок ✨</p>
                <input className="field is-error" placeholder="Поле с ошибкой" />
                <p className="help is-error">Например: введён неверный формат</p>
              </div>

              <div className="space-y-3">
                <div className="alert alert-success">Успех! Операция выполнена.</div>
                <div className="alert alert-warning">Внимание: Проверьте данные.</div>
                <div className="alert alert-error">Ошибка: Что-то пошло не так.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Content patterns for books */}
        <section>
          <header className="mb-4">
            <h2 className="h2">Паттерны для книжного контента</h2>
            <p className="small">Готовые карточки под описание книги, статус и цену.</p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="h3 mb-1">Описание книги</div>
              <p className="body text-[var(--text-muted)]">Короткая аннотация книги. Длина — 2–4 строки, затем ссылка «Читать далее».</p>
              <button className="btn btn-ghost btn-sm mt-3">Читать далее</button>
            </div>
            <div className="card p-6">
              <div className="h3 mb-1">Статус книги</div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-3 py-1 small">
                <span className="h-2 w-2 rounded-full" style={{background:"var(--success)"}}/> 
                Доступна
              </div>
            </div>
            <div className="card p-6">
              <div className="h3 mb-1">Цена / Подписка</div>
              <div className="display leading-none">150₴</div>
              <div className="small text-[var(--text-muted)]">/ месяц</div>
              <button className="btn btn-primary btn-md mt-4">Орендувати</button>
            </div>
          </div>
        </section>

        {/* Footer note */}
        <section className="small text-center text-[var(--text-muted)] pt-6 pb-10">
          Все элементы на странице собраны по единым принципам: контраст, иерархия, ритм, модульная сетка и единые токены.
        </section>
      </main>
    </div>
  );
}
