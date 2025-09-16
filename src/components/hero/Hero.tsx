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
							<div className="flex flex-col gap-3">
								<Badge className="w-fit self-start inline-flex items-center gap-2 rounded-full border-2 px-5 py-2 bg-[#FFF7E6] border-[#F5C242] text-[#D97706] shadow-sm">
									<BookOpen className="w-4 h-4 text-[#D97706]" />
									Хто багато читає — той багато знає
								</Badge>
							</div>

							<h1 className="text-h1 font-bold leading-tight tracking-tight">
								Книгарня за підпискою у Миколаєві
							</h1>

							<p className="lead">
								Вітаємо у книгарні за підпискою. Обирайте план, шукайте улюблені книжки і залишайте заявку на підписку. Самовивіз у самому центрі міста: вул.Маріупольська 13/2 (Cімейне кафе Family Palace)
							</p>

							<div className="flex flex-col sm:flex-row gap-4">
								<Link 
									href="#subscribe" 
									className="btn-primary btn-lg"
								>
									Оформити підписку
								</Link>
								<Link 
									href="/books" 
									className="btn-secondary btn-lg"
								>
									Перейти до каталогу
								</Link>
							</div>

							{/* Дополнительная информация */}
							<div className="flex items-center gap-6 pt-2">
								<div className="flex items-center gap-2">
									<div className="size-2 rounded-2xl bg-brand" />
									<span className="text-small">Самовивіз з точки</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="size-2 rounded-2xl bg-brand" />
									<span className="text-small">Легкий обмін книг</span>
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