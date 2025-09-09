import Link from "next/link"

export default function FinalCTA() {
	return (
		<section className="py-16 lg:py-24">
			<div className="relative overflow-hidden rounded-3xl border border-[--line] p-8 lg:p-12 bg-neutral-0 shadow-soft">
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
							<Link href="/books#top" className="inline-flex items-center justify-center rounded-2xl font-semibold h-12 px-6 bg-white text-[#111827] border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2">
								Перейти до каталогу
							</Link>
							<Link href="/books?rent=1#rent-form" className="inline-flex items-center justify-center rounded-2xl font-semibold h-12 px-6 bg-[#F7C948] text-[#111827] hover:bg-[#E0AE22] transition-colors shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7C948] focus-visible:ring-offset-2">
								Оформити підписку
							</Link>
						</div>
					</div>

					<ul className="grid gap-3 text-body-sm text-[--ink]">
						<li className="flex items-center gap-2">
							<span className="size-2 rounded-2xl bg-accent" /> Гнучкі плани — без прихованих платежів
						</li>
						<li className="flex items-center gap-2">
							<span className="size-2 rounded-2xl bg-brand-accent" /> Доставка або зручна точка видачі
						</li>
						<li className="flex items-center gap-2">
							<span className="size-2 rounded-2xl bg-accent" /> Вибір для дітей і дорослих
						</li>
					</ul>
				</div>

				{/* мʼяке світло */}
				<div className="pointer-events-none absolute -left-10 -bottom-10 size-56 rounded-2xl bg-neutral-0/40 blur-3xl" />
			</div>
		</section>
	)
}
