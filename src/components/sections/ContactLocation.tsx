"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Package,
  RefreshCw,
  Info,
  Clock,
  Phone,
  ExternalLink,
} from "lucide-react";

type Mode = "pickup" | "nova_poshta" | "exchange";

type GetBooksProps = {
  hasActiveSubscription?: boolean;
  data?: {
    pickup: {
      address: string;
      schedule: string;
      phone: string;
      email?: string;
      instagram?: string;
      mapEmbedSrc: string; // Google Maps iframe src
      note?: string;
    };
    courier: {
      note?: string;
    };
    novaPoshta: {
      note?: string;
    };
    exchange: {
      note?: string;
    };
  };
};

// ❗ Пример дефолтных данных (можешь вынести в site.ts)
const DEFAULT_DATA: NonNullable<GetBooksProps["data"]> = {
  pickup: {
    address: "м. Миколаїв, вул. Маріупольська 13/2",
    schedule: "Пн–Пт 9:00–18:00, Сб 10:00–16:00 (Нд — вихідний)",
    phone: "+38 (063) 856-54-14",
    email: "info@stefa.books",
    instagram: "@stefa.books",
    mapEmbedSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2719.8234567890123!2d31.9946!3d46.9658!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40c5c16a12345678%3A0x1234567890abcdef!2z0LLRg9C7LiDQnNCw0YDRltGD0L_QvtC70YzRgdGM0LrQsCwgMTMvMiwg0JzQuNC60L7Qu9Cw0ZfQsiwg0KPQutGA0LDRl9C90LA!5e0!3m2!1suk!2sua!4v1234567890123!5m2!1suk!2sua",
    note: "Видаємо готові замовлення та оформлюємо обмін.",
  },
  courier: {
    note:
      "Доставка в день замовлення або наступного дня за домовленістю. Повернення можливе курʼєром або у пункті самовивозу.",
  },
  novaPoshta: {
    note:
      "Відправляємо протягом 24 годин. Трекінг надсилаємо у повідомленні. Можливий гарантійний депозит згідно правил підписки.",
  },
  exchange: {
    note:
      "Залишаєте попередню книгу — отримуєте нову. Доступні способи: самовивіз.",
  },
};

export default function ContactLocation({
  hasActiveSubscription = false,
  data = DEFAULT_DATA,
}: GetBooksProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("pickup");

  const title = "Як отримати книги";
  const subtitle = hasActiveSubscription
    ? "У вас активна підписка. Оберіть зручний спосіб отримання або обміну."
    : "Щоб отримувати книги, спочатку оформіть підписку. Доступні тарифи: Mini (300₴/міс, 1 книга), Maxi (500₴/міс, 2 книги).";

  const view = useMemo(() => {
    switch (mode) {
      case "pickup":
        return {
          icon: MapPin,
          name: "Самовивіз",
          bullets: [
            { label: "Адреса:", value: data.pickup.address },
            { label: "Графік:", value: data.pickup.schedule },
            data.pickup.note ? { label: "", value: data.pickup.note } : null,
          ].filter(Boolean),
          important: hasActiveSubscription ? [
            "Попередньо зателефонуйте перед візитом.",
            "Мати документ, що посвідчує особу.", 
            "Книги видаються згідно з активною підпискою.",
          ] : [
            "Mini (300₴/міс) - 1 книга за раз на місяць.",
            "Maxi (500₴/міс) - до 2 книг за раз на місяць.",
            "Попередньо зателефонуйте для уточнення деталей.",
          ],
          cta: hasActiveSubscription ? "Запланувати візит" : "Оформити підписку",
        };
      case "nova_poshta":
        return {
          icon: Package,
          name: "Нова пошта / Поштомат",
          bullets: ["Цей спосіб доставки поки що в розробці та невдовзі буде доступний."],
          important: [
            "Функція ще не активна.",
            "Будемо повідомляти про запуск у соціальних мережах.",
          ],
          cta: "Поки недоступно",
        };
      case "exchange":
        return {
          icon: RefreshCw,
          name: "Обмін книги",
          bullets: [data.exchange.note ?? ""],
          important: hasActiveSubscription ? [
            "Обмін доступний лише з активною підпискою.",
            "Оберіть спосіб: самовивіз або Нова пошта.",
          ] : [
            "Потрібна активна підписка для обміну книг.",
            "Mini (300₴/міс) - обміняйте 1 книгу на іншу.",
            "Maxi (500₴/міс) - обміняйте до 2 книг на інші.",
          ],
          cta: hasActiveSubscription ? "Оформити обмін" : "Оформити підписку",
        };
      default:
        return {
          icon: MapPin,
          name: "Самовивіз",
          bullets: [],
          important: [],
          cta: "Оформити підписку",
        };
    }
  }, [mode, hasActiveSubscription, data]);

  const Icon = view.icon;

  const handleCTA = () => {
    if (mode === "nova_poshta") {
      // Нова пошта недоступна
      return;
    }
    if (!hasActiveSubscription) {
      router.push("/subscribe"); // страница подписки
      return;
    }
    // Маршруты под себя:
    if (mode === "pickup") router.push("/account/visit");
    if (mode === "exchange") router.push("/account/exchange");
  };

  return (
    <section id="pickup-location" className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-gradient-to-b from-neutral-50 to-white py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <header className="text-center mb-8 lg:mb-12">
          <h2 className="text-2xl sm:text-h1 text-neutral-900 mb-4">
            {title}
          </h2>
          <p className="text-body-lg text-neutral-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </header>

        {/* Обёртка */}
        <div className="grid gap-6">
          {/* Центральная колонка: карта/контент */}
          <div className="space-y-6">
            {/* Табы */}
            <div className="flex flex-wrap gap-2">
              <Tab active={mode === "pickup"} onClick={() => setMode("pickup")} icon={<MapPin className="h-4 w-4" />}>
                Самовивіз
              </Tab>
              <Tab
                active={mode === "nova_poshta"}
                onClick={() => setMode("nova_poshta")}
                icon={<Package className="h-4 w-4" />}
              >
                Нова пошта
              </Tab>
              <Tab
                active={mode === "exchange"}
                onClick={() => setMode("exchange")}
                icon={<RefreshCw className="h-4 w-4" />}
              >
                Обмін
              </Tab>
            </div>


            {/* Информация + карта в одном ряду */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Информационный блок (слева) */}
              <div className="card p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-neutral-100">
                      <Icon className="h-5 w-5 text-neutral-800" />
                    </span>
                    <h3 className="text-body-lg lg:text-body-lg font-semibold text-neutral-900">
                      {view.name}
                    </h3>
                  </div>

                  <ul className="space-y-4 mb-6">
                    {view.bullets.map((b, i) => (
                      <li key={i} className="flex gap-3">
                        <Clock className="mt-1 h-5 w-5 shrink-0 text-neutral-600" />
                        <div className="text-body leading-relaxed">
                          {typeof b === 'string' ? (
                            <span className="text-neutral-800 font-medium">{b}</span>
                          ) : b && typeof b === 'object' && 'label' in b ? (
                            <span>
                              <span className="text-neutral-900 font-bold">{b.label}</span>
                              <span className="text-neutral-800 font-medium ml-1">{b.value}</span>
                            </span>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Динамичное «Важливо» */}
                  {view.important.length > 0 && (
                    <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 mb-6">
                      <div className="mb-4 flex items-center gap-2 text-yellow-900">
                        <Info className="h-5 w-5" />
                        <span className="font-bold text-base">Важливо знати</span>
                      </div>
                      <ul className="space-y-3">
                        {view.important.map((b, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="w-2 h-2 bg-accent rounded-2xl mt-2 flex-shrink-0"></span>
                            <span className="text-body text-yellow-900 font-medium leading-relaxed">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleCTA}
                    disabled={mode === "nova_poshta"}
                    className={`rounded-2xl px-6 py-3 font-semibold transition shadow-md hover:shadow-lg ${
                      mode === "nova_poshta"
                        ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                        : "bg-[#F7C948] text-neutral-900 hover:bg-[#E0AE22]"
                    }`}
                  >
                    {view.cta}
                  </button>

                  {/* Контакт под рукой */}
                  <a
                    href={`tel:${(data.pickup.phone || "").replace(/\s|\(|\)|-/g, "")}`}
                    className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 px-4 py-3 text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    {data.pickup.phone}
                  </a>
                </div>
              </div>
              
              {/* Карта (справа) */}
              <div className="card overflow-hidden">
                <iframe
                  title="Stefa.books — карта самовивозу"
                  src={data.pickup.mapEmbedSrc}
                  width="100%"
                  height="400"
                  loading="lazy"
                  style={{ border: 0 }}
                  className="block"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
                <div className="p-4 bg-neutral-50 border-t border-neutral-200">
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-center">
                      <p className="font-semibold text-neutral-900">
                        м. Миколаїв,<br />
                        вул. Маріупольська 13/2
                      </p>
                      <p className="text-body-sm text-neutral-600">{data.pickup.schedule}</p>
                    </div>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://maps.google.com/?q=${encodeURIComponent(
                        data.pickup.address
                      )}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F7C948] text-neutral-900 rounded-2xl hover:bg-[#E0AE22] transition-colors font-semibold shadow-sm hover:shadow-md text-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Відкрити в картах
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ————— UI helpers ————— */

function Tab({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-body-sm transition",
        active
          ? "border-accent-light bg-yellow-100 text-yellow-900"
          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
      ].join(" ")}
      aria-pressed={active}
      type="button"
    >
      {icon}
      {children}
    </button>
  );
}

