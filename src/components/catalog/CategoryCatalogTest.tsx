'use client';

export function CategoryCatalogTest() {
  const testCategories = [
    { id: '1', name: 'Тестова категорія 1', color: '#FF6B9D', icon: '📚' },
    { id: '2', name: 'Тестова категорія 2', color: '#2563EB', icon: '🧚' }
  ];

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Test Categories</h2>
      <div className="space-y-4">
        {testCategories.map((category) => (
          <div
            key={category.id}
            className="flex items-center gap-3 p-4 rounded-xl"
            style={{ 
              backgroundColor: `${category.color}20`,
              borderLeft: `4px solid ${category.color}` 
            }}
          >
            <span className="text-2xl">{category.icon}</span>
            <h3 className="text-lg font-semibold text-gray-800">
              {category.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}