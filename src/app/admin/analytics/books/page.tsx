'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

// Mock book analytics data - in a real app, this would come from your API
const mockBookAnalytics = {
  totalBooks: 567,
  booksAdded: 24,
  booksRented: 142,
  averageRating: 4.2,
  topCategories: [
    { name: 'Fiction', count: 124, percentage: 22 },
    { name: 'Non-Fiction', count: 87, percentage: 15 },
    { name: 'Science Fiction', count: 65, percentage: 11 },
    { name: 'Mystery', count: 52, percentage: 9 },
    { name: 'Romance', count: 78, percentage: 14 },
  ],
  popularBooks: [
    { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category_id: 'fiction', category_name: 'Fiction', rating: 4.2, rentals: 42 },
    { id: '2', title: 'To Kill a Mockingbird', author: 'Harper Lee', category_id: 'fiction', category_name: 'Fiction', rating: 4.5, rentals: 38 },
    { id: '3', title: '1984', author: 'George Orwell', category_id: 'fiction', category_name: 'Fiction', rating: 4.7, rentals: 35 },
    { id: '4', title: 'Pride and Prejudice', author: 'Jane Austen', category_id: 'romance', category_name: 'Romance', rating: 4.3, rentals: 31 },
    { id: '5', title: 'The Catcher in the Rye', author: 'J.D. Salinger', category_id: 'fiction', category_name: 'Fiction', rating: 4.0, rentals: 29 },
  ],
};

export default function BookAnalyticsPage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-h1">Book Analytics</h1>
          <p className="text-gray-500">Insights into book performance and popularity</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Link href="/admin/analytics">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
      
      {/* Book Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body-sm font-medium">Total Books</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h2">{mockBookAnalytics.totalBooks}</div>
            <p className="text-caption text-muted-foreground">All books in catalog</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body-sm font-medium">New Books</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h2">{mockBookAnalytics.booksAdded}</div>
            <p className="text-caption text-muted-foreground">Added in last 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body-sm font-medium">Books Rented</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h2">{mockBookAnalytics.booksRented}</div>
            <p className="text-caption text-muted-foreground">Rented in last 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h2">{mockBookAnalytics.averageRating}</div>
            <p className="text-caption text-muted-foreground">Across all books</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>
              Most popular book categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockBookAnalytics.topCategories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{category.name}</span>
                    <span>{category.count} books</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-2xl h-2">
                    <div 
                      className="bg-brand-accent-light h-2 rounded-2xl" 
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Popular Books */}
        <Card>
          <CardHeader>
            <CardTitle>Most Rented Books</CardTitle>
            <CardDescription>
              Books with the highest rental counts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockBookAnalytics.popularBooks.map((book) => (
                <div key={book.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-3 h-16 w-12 bg-gray-200 rounded flex-shrink-0"></div>
                    <div>
                      <p className="font-medium">{book.title}</p>
                      <p className="text-body-sm text-muted-foreground">{book.author}</p>
                      <div className="flex items-center mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {book.category_name}
                        </Badge>
                        <span className="text-caption text-muted-foreground ml-2">
                          ★ {book.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{book.rentals} rentals</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}