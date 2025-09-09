'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Dynamically load SubscribeModal only when needed
const SubscribeModal = dynamic(() => import('../SubscribeModal'), {
  ssr: false,
  loading: () => null // Modal doesn't need loading state
});

type PlanKey = 'mini' | 'maxi';

export default function PlansLite() {
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('mini');

  const setPlanAndGo = useCallback((plan: PlanKey) => {
    // Открываем модальное окно подписки с выбранным планом
    setSelectedPlan(plan);
    setSubscribeModalOpen(true);
  }, []);

  return (
    <section id="plans" className="section">
      <div className="max-w-4xl mx-auto text-center">
        <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
          {/* Mini */}
          <div className="card hover-lift">
            {/* Illustration area */}
            <div className="w-32 h-32 mx-auto mb-6">
              <Image
                src="/images/books/Mini1.png"
                alt="Mini план - 1 книга"
                width={128}
                height={128}
                className="object-contain w-full h-full"
              />
            </div>
            
            <h4 className="h1 mb-2">Mini</h4>
            <p className="h2 mb-2">300 грн/міс.</p>

            <button
              onClick={() => setPlanAndGo('mini')}
              className="btn btn-primary btn-lg btn-block"
            >
              Обрати Mini
            </button>
          </div>

          {/* Maxi */}
          <div className="card hover-lift border-[var(--brand)] bg-[var(--brand)]/5">
            {/* Illustration area */}
            <div className="w-32 h-32 mx-auto mb-6">
              <Image
                src="/images/books/Maxi2.png"
                alt="Maxi план - 2 книги"
                width={128}
                height={128}
                className="object-contain w-full h-full"
              />
            </div>
            
            <h4 className="h1 mb-2">Maxi</h4>
            <p className="h2 mb-2 text-[var(--accent)]">500 грн/міс.</p>

            <button
              onClick={() => setPlanAndGo('maxi')}
              className="btn btn-primary btn-lg btn-block"
            >
              Обрати Maxi
            </button>
          </div>
        </div>

        {/* Link to subscription form */}
        <div className="mt-8">
          <a 
            href="/form" 
            className="inline-flex items-center text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          >
            Оформити підписку →
          </a>
        </div>
      </div>
      
      <SubscribeModal 
        isOpen={subscribeModalOpen} 
        onClose={() => setSubscribeModalOpen(false)} 
        book={null}
        defaultPlan={selectedPlan}
      />
    </section>
  );
}