"use client";
import { Truck, Shield, Heart } from "lucide-react";

const STATS = [
  { k: "readers", label: "читачів у Миколаєві", value: "1 200+", hint: "за останній рік" },
  { k: "books",   label: "книг у каталозі",      value: "1 000+", hint: "постійне поповнення" },
  { k: "rating",  label: "середній рейтинг",     value: "4.9/5", hint: "за відгуками" },
];

const BADGES = [
  { icon: Truck, label: "Зручна видача / доставка" },
  { icon: Shield, label: "Прозорі умови оренди" },
  { icon: Heart, label: "Локальний сервіс Миколаєва" },
];

const REVIEWS = [
  {
    name: "Олена, мама 2 дітей",
    text: "Зручно брати дитячі книги на місяць — діти змінюють інтереси, а витрачати на купівлю кожної не хочеться.",
  },
  {
    name: "Руслан, студент",
    text: "Знайшов рідкісні нон‑фікшн видання. Оформлення за 2 хвилини, забрав у точці видачі.",
  },
];

export default function SocialProof() {
  return (
    <section className="py-16 lg:py-24">
      {/* лічильники */}
      <div className="grid gap-4 sm:grid-cols-3">
        {STATS.map(s => (
          <div key={s.k} className="card p-6 text-center">
            <div className="text-3xl font-extrabold text-[--ink]">{s.value}</div>
            <div className="text-muted">{s.label}</div>
            <div className="text-xs text-muted mt-1">{s.hint}</div>
          </div>
        ))}
      </div>

      {/* бейджі довіри */}
      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        {BADGES.map(b => {
          const IconComponent = b.icon;
          return (
            <div key={b.label} className="rounded-3xl border border-[--line] bg-white p-4 flex items-center gap-3">
              <div className="size-10 rounded-2xl border border-black/10 bg-white grid place-items-center">
                <IconComponent size={20} style={{ color: 'var(--brand)' }} />
              </div>
              <span className="text-sm font-medium text-[--ink]">{b.label}</span>
            </div>
          );
        })}
      </div>

      {/* міні‑відгуки */}
      <div className="grid lg:grid-cols-2 gap-4 mt-8">
        {REVIEWS.map(r => (
          <figure key={r.name} className="rounded-3xl border border-[--line] bg-white p-6">
            <figcaption>
              <p className="text-[--ink]">{r.text}</p>
              <div className="text-sm text-muted mt-2">— {r.name}</div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
