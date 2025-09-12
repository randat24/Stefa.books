"use client";

import { useEffect, useMemo } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQStructuredDataProps {
  faqs: FAQItem[];
  baseUrl?: string;
}

export function FAQStructuredData({ 
  faqs, 
  baseUrl = 'https://stefa-books.com.ua' 
}: FAQStructuredDataProps) {
  const jsonLd = useMemo(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    return structuredData;
  }, [faqs]);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
    script.id = 'faq-structured-data';
    
    // Remove existing script if any
    const existingScript = document.getElementById('faq-structured-data');
    if (existingScript) {
      existingScript.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('faq-structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [jsonLd]);

  return null;
}

// Предустановленные FAQ для Stefa.books
export const defaultFAQs: FAQItem[] = [
  {
    question: "Як працює підписка на книги?",
    answer: "Підписка дозволяє читати необмежену кількість книг з нашого каталогу за фіксовану щомісячну плату. Ви можете читати книги онлайн або завантажувати їх для офлайн-читання."
  },
  {
    question: "Скільки коштує оренда книги?",
    answer: "Вартість оренди залежить від конкретної книги та тривалості оренди. Зазвичай ціни коливаються від 50 до 200 гривень за тиждень. Точну ціну ви можете побачити на сторінці книги."
  },
  {
    question: "Які вікові категорії книг доступні?",
    answer: "У нас є книги для дітей від 0 до 18 років: для малюків (0-3 роки), дошкільнят (3-6 років), молодших школярів (6-10 років), середніх школярів (10-14 років) та старших школярів (14-18 років)."
  },
  {
    question: "Чи можна скачати книгу для офлайн-читання?",
    answer: "Так, більшість книг доступні для завантаження в форматі PDF або EPUB. Після оренди або підписки ви можете завантажити книгу на свій пристрій для читання без інтернету."
  },
  {
    question: "Як довго триває оренда книги?",
    answer: "Стандартна оренда триває 7 днів, але ви можете вибрати більш тривалий період (14 або 30 днів) за додаткову плату. Після закінчення терміну оренди доступ до книги автоматично припиняється."
  },
  {
    question: "Чи можна повернути гроші за оренду?",
    answer: "Так, ми надаємо повернення коштів протягом 24 годин після початку оренди, якщо ви ще не почали читати книгу. Для повернення зверніться до нашої служби підтримки."
  },
  {
    question: "Які способи оплати ви приймаєте?",
    answer: "Ми приймаємо оплату картками Visa, Mastercard, через Monobank, Privat24, а також електронними грошима. Всі платежі обробляються безпечно через зашифроване з'єднання."
  },
  {
    question: "Чи є обмеження на кількість книг при підписці?",
    answer: "Ні, при підписці ви можете читати необмежену кількість книг з нашого каталогу. Єдине обмеження - одночасно ви можете мати в оренді не більше 5 книг."
  }
];
