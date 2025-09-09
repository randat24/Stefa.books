"use client";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import HeroStepsCard from "./HeroStepsCard";

export default function Hero() {
	return (
		<section className="section-sm">
			<div className="container">
				<div className="card gap-fluid overflow-hidden">
					<div className="relative grid items-start gap-6 md:gap-8 md:grid-cols-1 lg:grid-cols-[1.2fr,1fr]">
						{/* LEFT */}
						<div className="grid gap-6 md:px-4 lg:pl-6 lg:pr-0">
							<Badge>
								<BookOpen className="w-3 h-3 mr-1 text-[var(--brand)]" />
								Книжкова оренда у Миколаєві
							</Badge>

							<h1 className="display">
								Читай легко. Оформлюй підписку та забирай книги зручно.
							</h1>

							<p className="lead">
								Вітаємо у книгарні за підпискою. Обирай план, шукай улюблені книжки і залишай заявку на оренду.
								Самовивіз з точки: вул. Маріупольська 13/2, Миколаїв.
							</p>

							{/* Краткая статистика */}
							<div className="grid grid-cols-3 border-y border-[var(--line)] gap-4 py-4">
								<div className="text-center">
									<div className="h3 font-bold">500+</div>
									<div className="small">книг</div>
								</div>
								<div className="text-center border-x border-[var(--line)]">
									<div className="h3 font-bold">300₴</div>
									<div className="small">1 книжка / міс</div>
								</div>
								<div className="text-center">
									<div className="h3 font-bold">500₴</div>
									<div className="small">1 - 2 книжки</div>
								</div>
							</div>

							<div className="flex flex-col sm:flex-row gap-4">
								<Link 
									href="#subscribe" 
									className="inline-flex items-center justify-center rounded-2xl font-semibold h-12 px-6 bg-[#F7C948] text-[#111827] hover:bg-[#E0AE22] transition-colors shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7C948] focus-visible:ring-offset-2"
								>
									Оформити підписку
								</Link>
								<Link 
									href="/books" 
									className="inline-flex items-center justify-center rounded-2xl font-semibold h-12 px-6 bg-white text-[#111827] border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2"
								>
									Перейти до каталогу
								</Link>
							</div>

							{/* Дополнительная информация */}
							<div className="flex items-center small gap-6 pt-2">
								<div className="flex items-center gap-2">
									<div className="size-2 rounded-2xl bg-[var(--brand)]" />
									Самовивіз з точки
								</div>
								<div className="flex items-center gap-2">
									<div className="size-2 rounded-2xl bg-[var(--brand)]" />
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