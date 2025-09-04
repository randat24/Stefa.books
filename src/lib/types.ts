export type Book = {
  id: string;
  title: string;
  author: string;
  cover: string;
  category: string;
  code: string;        // напр. "NF-002"
  pages: number;       // 280
  status?: 'В тренді' | 'Бестселер' | 'Нове' | string;
  age?: string;
  available: boolean;
  price?: { old?: number; current: number };
  rating?: { value: number; count: number };
  badges?: ("В тренді"|"Бестселер"|"Знижка"|"Нове"|"Класика")[];
  short?: string;
};
