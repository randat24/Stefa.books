#!/usr/bin/env node

/**
 * Быстрая загрузка обложек в Cloudinary
 */

const cloudinary = require('cloudinary').v2;

// Конфигурация Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dchx7vd97',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const books = [
  {
    "code": "7873",
    "title": "Ким хотіла бути Панда?",
    "author": "Світлана Мирошниченко",
    "category": "Казка",
    "description": "Чарівна історія про панду, яка мріє стати кимось особливим. Книга для дітей дошкільного віку з красивими ілюстраціями.",
    "isbn": "978-966-942-123-4",
    "pages": 32,
    "ageRange": "3-6 років",
    "language": "uk",
    "publisher": "Віват",
    "year": 2023,
    "coverUrl": "https://drive.google.com/uc?export=view&id=1ABC123",
    "price": 240
  },
  {
    "code": "5560",
    "title": "Котигорошко",
    "author": "Невідомий автор",
    "category": "Казки",
    "description": "Українська народна казка про хороброго хлопчика Котигорошка, який перемагає змія.",
    "isbn": "978-966-942-124-1",
    "pages": 24,
    "ageRange": "3-6 років",
    "language": "uk",
    "publisher": "Віват",
    "year": 2023,
    "coverUrl": "https://drive.google.com/uc?export=view&id=1DEF456",
    "price": 203
  },
  {
    "code": "3365",
    "title": "Джуді Муді. Книга 1",
    "author": "МакДоналд Меган",
    "category": "Пригоди",
    "description": "Перша книга серії про веселу дівчинку Джуді Муді та її пригоди.",
    "isbn": "978-966-942-125-8",
    "pages": 160,
    "ageRange": "6-9 років",
    "language": "uk",
    "publisher": "Видавництво Старого Лева",
    "year": 2022,
    "coverUrl": "https://drive.google.com/uc?export=view&id=1GHI789",
    "price": 158
  },
  {
    "code": "5616",
    "title": "Маленький принц",
    "author": "Антуан Де Сент-Екзюпері",
    "category": "Казка",
    "description": "Відома казка-притча про маленького принца, яка вчить дітей цінностям дружби та любові.",
    "isbn": "978-966-942-126-5",
    "pages": 96,
    "ageRange": "8-12 років",
    "language": "uk",
    "publisher": "КМ-Букс",
    "year": 2021,
    "coverUrl": "https://drive.google.com/uc?export=view&id=1JKL012",
    "price": 407
  },
  {
    "code": "6528",
    "title": "Українські казки",
    "author": "Невідомий автор",
    "category": "Казки",
    "description": "Збірка найкращих українських народних казок для дітей різного віку.",
    "isbn": "978-966-942-127-2",
    "pages": 128,
    "ageRange": "3-8 років",
    "language": "uk",
    "publisher": "Ранок",
    "year": 2023,
    "coverUrl": "https://drive.google.com/uc?export=view&id=1MNO345",
    "price": 300
  }
];

async function uploadCovers() {
  console.log('🚀 Начинаем загрузку обложек...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const book of books) {
    try {
      console.log(`📖 Обрабатываем: ${book.title} (${book.code})`);
      
      if (!book.coverUrl) {
        console.log('⏭️  Пропускаем (нет обложки)');
        continue;
      }
      
      const result = await cloudinary.uploader.upload(book.coverUrl, {
        public_id: `stefa-books/${book.code}`,
        folder: 'stefa-books',
        resource_type: 'image',
        transformation: [
          { width: 300, height: 400, crop: 'fill', quality: 'auto' }
        ]
      });
      
      console.log(`✅ Успешно загружено: ${result.secure_url}`);
      console.log(`UPDATE public.books SET cover_url = '${result.secure_url}' WHERE code = '${book.code}';`);
      successCount++;
      
    } catch (error) {
      console.error(`❌ Ошибка загрузки ${book.code}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Результат:`);
  console.log(`✅ Успешно: ${successCount}`);
  console.log(`❌ Ошибок: ${errorCount}`);
}

uploadCovers().catch(console.error);
