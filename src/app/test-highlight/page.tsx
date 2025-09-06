import TextHighlight from '@/components/ui/TextHighlight'

export default function TestHighlightPage() {
	return (
		<div className="min-h-screen bg-white py-16">
			<div className="container mx-auto px-4 max-w-4xl">
				<h1 className="text-4xl font-bold text-gray-900 mb-8">
					Тест фирменного выделения текста
				</h1>
				
				<div className="space-y-8">
					<section>
						<h2 className="text-2xl font-semibold text-gray-800 mb-4">
							Автоматическое выделение текста
						</h2>
						<p className="text-lg text-gray-700 leading-relaxed">
							Выделите этот текст мышью, чтобы увидеть фирменный желтый цвет выделения. 
							Это работает автоматически для всего сайта благодаря CSS псевдо-селекторам 
							<code className="bg-gray-100 px-2 py-1 rounded text-sm">::selection</code> и 
							<code className="bg-gray-100 px-2 py-1 rounded text-sm">::-moz-selection</code>.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-gray-800 mb-4">
							Ручное выделение с компонентом
						</h2>
						<p className="text-lg text-gray-700 leading-relaxed">
							Вы можете использовать компонент <TextHighlight>TextHighlight</TextHighlight> для 
							выделения важных слов и фраз. Также доступен вариант 
							<TextHighlight variant="light">светлого выделения</TextHighlight>.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-gray-800 mb-4">
							Примеры использования
						</h2>
						<div className="space-y-4">
							<div className="p-4 bg-gray-50 rounded-lg">
								<p className="text-gray-700">
									<strong>Кнопка подписки:</strong> Оформи <TextHighlight>підписку</TextHighlight> та забирай книги зручно.
								</p>
							</div>
							
							<div className="p-4 bg-gray-50 rounded-lg">
								<p className="text-gray-700">
									<strong>Акция:</strong> Специальная скидка <TextHighlight variant="light">20%</TextHighlight> на первую подписку!
								</p>
							</div>
							
							<div className="p-4 bg-gray-50 rounded-lg">
								<p className="text-gray-700">
									<strong>Новинка:</strong> В каталоге появились новые <TextHighlight>детские книги</TextHighlight> от популярных авторов.
								</p>
							</div>
						</div>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-gray-800 mb-4">
							CSS классы для выделения
						</h2>
						<div className="space-y-2 text-sm">
							<p><code className="bg-gray-100 px-2 py-1 rounded">.highlight</code> - основной фирменный желтый</p>
							<p><code className="bg-gray-100 px-2 py-1 rounded">.highlight-light</code> - светлый вариант</p>
							<p><code className="bg-gray-100 px-2 py-1 rounded">.selection-brand</code> - для настройки выделения текста</p>
							<p><code className="bg-gray-100 px-2 py-1 rounded">.selection-brand-light</code> - светлый вариант выделения</p>
						</div>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-gray-800 mb-4">
							Tailwind классы
						</h2>
						<div className="space-y-2 text-sm">
							<p><code className="bg-gray-100 px-2 py-1 rounded">bg-brand-yellow</code> - основной желтый фон</p>
							<p><code className="bg-gray-100 px-2 py-1 rounded">bg-brand-yellow-light</code> - светлый желтый фон</p>
							<p><code className="bg-gray-100 px-2 py-1 rounded">bg-brand-yellow-dark</code> - темный желтый фон</p>
							<p><code className="bg-gray-100 px-2 py-1 rounded">text-brand</code> - темный текст на желтом фоне</p>
						</div>
					</section>
				</div>
			</div>
		</div>
	)
}
