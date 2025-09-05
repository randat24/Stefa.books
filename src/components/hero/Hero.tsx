"use client";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import HeroStepsCard from "./HeroStepsCard";

export default function Hero() {
	return (
		<section className="section-sm">
			<div className="container">
				<div className="card gap-fluid overflow-hidden" style={{paddingInline: 'var(--space-8)', paddingBlock: 'var(--space-8)'}}>
					<div className="relative grid items-start gap-6 md:gap-8 md:grid-cols-1 lg:grid-cols-[1.2fr,1fr]">
						{/* LEFT */}
						<div style={{display: 'grid', gap: 'var(--space-6)'}} className="md:px-4 lg:pl-6 lg:pr-0">
							<Badge>
								<BookOpen className="w-3 h-3 mr-1" />
								Книжкова оренда у Миколаєві
							</Badge>

							<h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl 2xl:text-6xl text-gray-900 hero-title">
								Читай легко. Оформлюй підписку та забирай книги зручно.
							</h1>

							<p className="text-gray-600 hero-description" style={{fontSize: 'var(--font-size-lg)'}}>
								Вітаємо у книгарні за підпискою. Обирай план, шукай улюблені книжки і залишай заявку на оренду.
								Ми підготуємо і передамо у зручному місці.
							</p>

							{/* Краткая статистика */}
							<div className="grid grid-cols-3 border-y border-gray-200/60" style={{gap: 'var(--space-4)', paddingBlock: 'var(--space-4)'}}>
								<div className="text-center">
									<div className="font-bold text-gray-900" style={{fontSize: 'var(--font-size-xl)'}}>500+</div>
									<div className="text-gray-500" style={{fontSize: 'var(--font-size-sm)'}}>книг</div>
								</div>
								<div className="text-center border-x border-gray-200/60">
									<div className="font-bold text-gray-900" style={{fontSize: 'var(--font-size-xl)'}}>300₴</div>
									<div className="text-gray-500" style={{fontSize: 'var(--font-size-sm)'}}>1 книжка / міс</div>
								</div>
								<div className="text-center">
									<div className="font-bold text-gray-900" style={{fontSize: 'var(--font-size-xl)'}}>500₴</div>
									<div className="text-gray-500" style={{fontSize: 'var(--font-size-sm)'}}>1 - 2 книжки</div>
								</div>
							</div>

							<div className="flex flex-col sm:flex-row" style={{gap: 'var(--space-4)'}}>
								<Link 
									href="#subscribe" 
									className="btn-primary"
								>
									Оформити підписку
								</Link>
								<Link 
									href="/books" 
									className="btn-outline"
								>
									Перейти до каталогу
								</Link>
							</div>

							{/* Дополнительная информация */}
							<div className="flex items-center text-gray-500" style={{gap: 'var(--space-6)', paddingTop: 'var(--space-2)', fontSize: 'var(--font-size-sm)'}}>
								<div className="flex items-center" style={{gap: 'var(--space-2)'}}>
									<div className="size-2 rounded-full bg-brand-accent" />
									Безкоштовна доставка
								</div>
								<div className="flex items-center" style={{gap: 'var(--space-2)'}}>
									<div className="size-2 rounded-full bg-brand-yellow" />
									Легкий обмін книг
								</div>
							</div>
						</div>

						{/* RIGHT */}
						<div className="lg:sticky lg:top-8 md:px-0 md:w-full md:mx-auto lg:w-auto lg:mx-0 lg:pr-5 lg:pl-0">
							<HeroStepsCard />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
