'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { SubscribeModal } from '../SubscribeModal';

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
          <div className="relative rounded-3xl border-2 border-gray-200 bg-white p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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
            
            <h4 className="text-3xl font-bold text-gray-900 mb-2">Mini</h4>
            <p className="text-2xl font-bold text-gray-900 mb-2">300 грн/міс.</p>

            <button
              onClick={() => setPlanAndGo('mini')}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-6 rounded-2xl font-semibold transition-colors"
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
            
            <h4 className="text-3xl font-bold text-gray-900 mb-2">Maxi</h4>
            <p className="text-2xl font-bold text-brand-yellow-dark mb-2">500 грн/міс.</p>

            <button
              onClick={() => setPlanAndGo('maxi')}
              className="w-full bg-brand-yellow hover:bg-brand-yellow-dark text-gray-900 py-3 px-6 rounded-2xl font-semibold transition-colors"
            >
              Обрати Maxi
            </button>
          </div>
        </div>

        {/* Link to subscription form */}
        <div className="mt-8">
          <a 
            href="/form" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
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
