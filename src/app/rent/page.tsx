'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Mock book data - in a real app, this would come from your API
const mockBooks = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    category: 'Fiction',
    rating: 4.2,
    available: true,
    coverImage: '/placeholder-book-cover.jpg' },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    category: 'Fiction',
    rating: 4.5,
    available: true,
    coverImage: '/placeholder-book-cover.jpg' },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    category: 'Dystopian',
    rating: 4.7,
    available: false,
    coverImage: '/placeholder-book-cover.jpg' },
  {
    id: '4',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    category: 'Romance',
    rating: 4.3,
    available: true,
    coverImage: '/placeholder-book-cover.jpg' },
];

export default function RentPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredBooks = mockBooks.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-h1">Rent Books</h1>
          <p className="text-neutral-500">Browse and rent books from our collection</p>
        </div>
      </div>
      
      {/* Search */}
      <div className="mb-8">
        <Label htmlFor="search" className="sr-only">Search books</Label>
        <Input
          id="search"
          placeholder="Search books by title or author..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map((book: any) => (
          <Card key={book.id} className="flex flex-col">
            <div className="relative">
              <Image 
                src={book.coverImage} 
                alt={book.title}
                width={300}
                height={192}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <Badge className="absolute top-2 right-2" variant="secondary">
                {book.category}
              </Badge>
              {!book.available && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-lg">
                  <Badge variant="destructive">Not Available</Badge>
                </div>
              )}
            </div>
            <CardHeader className="flex-1 pb-2">
              <CardTitle className="text-body-lg line-clamp-2">{book.title}</CardTitle>
              <CardDescription className="line-clamp-1">{book.author}</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-accent mr-1">★</span>
                  <span>{book.rating}</span>
                </div>
                {book.available ? (
                  <Link href={`/rent/checkout?bookId=${book.id}`}>
                    <Button size="md">Rent Now</Button>
                  </Link>
                ) : (
                  <Button size="md" variant="outline" disabled>
                    Unavailable
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredBooks.length === 0 && (
        <Card className="py-12 text-center">
          <CardContent>
            <h3 className="text-body-lg font-semibold mb-2">No books found</h3>
            <p className="text-neutral-500 mb-4">Try adjusting your search terms</p>
            <Button onClick={() => setSearchTerm('')}>Clear Search</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}