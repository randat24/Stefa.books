import { Star, MessageCircle, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";

interface BookReviewsProps {
  rating?: number | null;
  rating_count?: number | null;
}

// Mock reviews data - in real app would come from database
const mockReviews = [
  {
    id: "1",
    author: "Марія К.",
    rating: 5,
    date: "15 лютого 2024",
    text: "Чудова книга для моєї 7-річної доньки! Захоплююча історія, красиві ілюстрації. Читали разом з великим задоволенням.",
    helpful: 12
  },
  {
    id: "2", 
    author: "Андрій М.",
    rating: 4,
    date: "8 лютого 2024",
    text: "Добра дитяча література. Сину сподобалось, хоча деякі моменти здались трохи складними для його віку.",
    helpful: 5
  },
  {
    id: "3",
    author: "Олена П.",
    rating: 5,
    date: "3 лютого 2024", 
    text: "Неймовірна книга! Діти просили читати знову і знову. Обов'язково візьмемо ще щось від цього автора.",
    helpful: 18
  }
];

export function BookReviews({ rating, rating_count }: BookReviewsProps) {
  const averageRating = rating || 0;
  const totalReviews = rating_count || mockReviews.length;

  return (
    <div className="space-y-6">
      {/* Overall Rating Summary */}
      <div className="bg-neutral-50 rounded-lg p-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-h1 text-neutral-900 mb-1">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-5 w-5 ${
                    i < Math.floor(averageRating) 
                      ? 'text-accent-light fill-current' 
                      : 'text-neutral-300'
                  }`} 
                />
              ))}
            </div>
            <div className="text-body-sm text-neutral-600">
              {totalReviews} відгуків
            </div>
          </div>
          
          <div className="flex-1">
            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(stars => {
                const count = stars === 5 ? 2 : stars === 4 ? 1 : 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                
                return (
                  <div key={stars} className="flex items-center gap-2 text-sm">
                    <span className="w-3">{stars}</span>
                    <Star className="h-3 w-3 text-accent-light fill-current" />
                    <div className="flex-1 bg-neutral-200 rounded-2xl h-2">
                      <div 
                        className="bg-accent-light h-2 rounded-2xl transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-neutral-600">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Write Review Button */}
        <div className="mt-6 pt-6 border-t border-neutral-200">
          <Button variant="outline" className="w-full">
            <MessageCircle className="h-4 w-4 mr-2" />
            Написати відгук
          </Button>
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-6">
        <h3 className="text-body-lg font-semibold text-neutral-900">
          Відгуки читачів
        </h3>
        
        {mockReviews.map((review) => (
          <div key={review.id} className="border-b border-neutral-200 pb-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-neutral-900">{review.author}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${
                          i < review.rating 
                            ? 'text-accent-light fill-current' 
                            : 'text-neutral-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-body-sm text-neutral-500">{review.date}</span>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                Підтверджена оренда
              </Badge>
            </div>
            
            <p className="text-neutral-700 mb-3 leading-relaxed">
              {review.text}
            </p>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="md" className="h-8 text-xs">
                <ThumbsUp className="h-3 w-3 mr-1" />
                Корисно ({review.helpful})
              </Button>
              <Button variant="outline" size="md" className="h-8 text-xs">
                <MessageCircle className="h-3 w-3 mr-1" />
                Відповісти
              </Button>
            </div>
          </div>
        ))}
        
        {/* Load More Reviews */}
        <div className="text-center">
          <Button variant="outline">
            Показати більше відгуків
          </Button>
        </div>
      </div>
    </div>
  );
}