import Link from "next/link"
import Image from "next/image"

export default function FinalCTA() {
	return (
		<section className="py-16 lg:py-24">
			<div className="relative overflow-hidden rounded-3xl border border-[--line] p-8 lg:p-12 bg-white shadow-soft">
				<div className="grid gap-8 lg:grid-cols-2 items-center">
					{/* Левая часть - текст и кнопки */}
					<div>
						<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
							Готові читати більше?<br/> Оформіть підписку вже сьогодні
						</h2>
						<p className="text-muted mt-3">
							Mini — 300 ₴/міс (1 книга за раз) • Maxi — 500 ₴/міс (2 книги за раз).
							Знайдіть улюблені видання в каталозі, а ми подбаємо про решту.
						</p>
						
						{/* Список преимуществ */}
						<ul className="grid gap-3 text-body-sm text-[--ink] mt-6">
							<li className="flex items-center gap-2">
								<span className="size-2 rounded-2xl bg-accent" /> Гнучкі плани — без прихованих платежів
							</li>
							<li className="flex items-center gap-2">
								<span className="size-2 rounded-2xl bg-brand-accent" /> Зручна точка видачі
							</li>
							<li className="flex items-center gap-2">
								<span className="size-2 rounded-2xl bg-accent" /> Вибір для дітей і дорослих
							</li>
						</ul>

						<div className="mt-6 flex flex-wrap gap-3">
							<Link href="/books#top" className="inline-flex items-center justify-center rounded-2xl font-semibold h-12 px-6 bg-white text-[#111827] border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2">
								Перейти до каталогу
							</Link>
							<Link href="/books?rent=1#rent-form" className="inline-flex items-center justify-center rounded-2xl font-semibold h-12 px-6 bg-[#F7C948] text-[#111827] hover:bg-[#E0AE22] transition-colors shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7C948] focus-visible:ring-offset-2">
								Оформити підписку
							</Link>
						</div>
					</div>

					{/* Правая часть - изображение */}
					<div className="relative">
						<div className="relative rounded-2xl overflow-hidden shadow-lg group">
							<Image
								src="/images/family-palace.jpg"
								alt="Family Palace - точка видачі книг"
								width={600}
								height={400}
								className="w-full h-auto object-cover transition-opacity duration-500 ease-in-out group-hover:opacity-0"
								priority
							/>
							<div className="absolute inset-0">
								<Image
									src="/images/family-palace-hover.jpg"
									alt="Family Palace (hover)"
									fill
									className="object-cover transition-opacity duration-500 ease-in-out opacity-0 group-hover:opacity-100"
									sizes="(max-width: 768px) 100vw, 600px"
								/>
							</div>
							{/* Наложение с информацией */}
							<div className="absolute bottom-4 left-4 space-y-1 z-10">
								<span className="inline-block bg-[#F7C948] text-neutral-900 px-2 py-[2px] rounded-none text-lg md:text-xl font-semibold leading-tight">
									Family Palace
								</span>
								<span className="block">
									<span className="inline bg-[#F7C948] text-neutral-900 px-2 py-[1px] rounded-none text-[13px] md:text-sm font-medium leading-tight">Зручна точка видачі книг у центрі міста</span>
								</span>
								<span className="block">
									<span className="inline bg-[#F7C948] text-neutral-900 px-2 py-[1px] rounded-none text-[13px] md:text-sm font-medium leading-tight">вул. Маріупольська 13/2, Миколаїв</span>
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

				{/* мʼяке світло */}
				<div className="pointer-events-none absolute -left-10 -bottom-10 size-56 rounded-2xl bg-white/40 blur-3xl" />
		</section>
	)
}
