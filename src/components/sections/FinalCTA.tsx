import Link from "next/link"

export default function FinalCTA() {
	return (
		<section className="py-16 lg:py-24">
			<div className="relative overflow-hidden rounded-3xl border border-[--line] p-8 lg:p-12 bg-white shadow-soft">
				<div className="grid gap-6 lg:grid-cols-2 items-center">
					<div>
						<h2 className="h2">
							Готові читати більше?<br/> Оформіть підписку вже сьогодні
						</h2>
						<p className="text-muted mt-3">
							Mini — 300 ₴/міс (1 книга за раз) • Maxi — 500 ₴/міс (2 книги за раз).
							Знайдіть улюблені видання в каталозі, а ми подбаємо про решту.
						</p>
						<div className="mt-6 flex flex-wrap gap-3">
							<Link href="/books#top" className="inline-flex items-center justify-center rounded-full font-semibold h-12 px-6 bg-yellow-500 text-slate-900 hover:bg-yellow-400 transition-colors shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2">
								Перейти до каталогу
							</Link>
							<Link href="/books?rent=1#rent-form" className="inline-flex items-center justify-center rounded-full font-semibold h-12 px-6 bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2">
								Оформити підписку
							</Link>
						</div>
					</div>

					<ul className="grid gap-3 text-sm text-[--ink]">
						<li className="flex items-center gap-2">
							<span className="size-2 rounded-full bg-yellow-500" /> Гнучкі плани — без прихованих платежів
						</li>
						<li className="flex items-center gap-2">
							<span className="size-2 rounded-full bg-blue-500" /> Доставка або зручна точка видачі
						</li>
						<li className="flex items-center gap-2">
							<span className="size-2 rounded-full bg-yellow-500" /> Вибір для дітей і дорослих
						</li>
					</ul>
				</div>

				{/* мʼяке світло */}
				<div className="pointer-events-none absolute -left-10 -bottom-10 size-56 rounded-full bg-white/40 blur-3xl" />
			</div>
		</section>
	)
}
