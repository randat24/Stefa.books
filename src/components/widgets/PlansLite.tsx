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
    <section id="plans" className="py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
          {/* Mini */}
          <div className="relative rounded-3xl border-2 border-neutral-200 bg-neutral-0 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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
            
            <h4 className="text-h1 text-neutral-900 mb-2">Mini</h4>
            <p className="text-h2 text-neutral-900 mb-2">300 грн/міс.</p>

            <button
              onClick={() => setPlanAndGo('mini')}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-neutral-0 py-3 px-6 rounded-2xl font-semibold transition-colors"
            >
              Обрати Mini
            </button>
          </div>

          {/* Maxi */}
          <div className="relative rounded-3xl border-2 border-yellow-200 bg-yellow-50 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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
            
            <h4 className="text-h1 text-neutral-900 mb-2">Maxi</h4>
            <p className="text-h2 text-accent-dark mb-2">500 грн/міс.</p>

            <button
              onClick={() => setPlanAndGo('maxi')}
              className="w-full bg-accent hover:bg-accent-dark text-neutral-900 py-3 px-6 rounded-2xl font-semibold transition-colors"
            >
              Обрати Maxi
            </button>
          </div>
        </div>

        {/* Link to subscription form */}
        <div className="mt-8">
          <a 
            href="/form" 
            className="inline-flex items-center text-neutral-600 hover:text-neutral-900 transition-colors"
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
