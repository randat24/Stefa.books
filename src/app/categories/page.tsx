'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

// Mock categories data - in a real app, this would come from your API
const mockCategories = [
  { id: '1', name: 'Fiction', bookCount: 124, description: 'Novels and fictional works' },
  { id: '2', name: 'Non-Fiction', bookCount: 87, description: 'Biographies, history, and educational works' },
  { id: '3', name: 'Science Fiction', bookCount: 65, description: 'Futuristic and speculative fiction' },
  { id: '4', name: 'Mystery', bookCount: 52, description: 'Detective and thriller novels' },
  { id: '5', name: 'Romance', bookCount: 78, description: 'Love stories and romantic fiction' },
  { id: '6', name: 'Biography', bookCount: 43, description: 'Life stories of notable people' },
  { id: '7', name: 'HistoryIcon', bookCount: 39, description: 'Historical accounts and events' },
  { id: '8', name: 'Self-Help', bookCount: 31, description: 'Personal development and advice' },
];

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredCategories = mockCategories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-h1">Book Categories</h1>
          <p className="text-neutral-500">Browse books by category</p>
        </div>
      </div>
      
      {/* Search */}
      <div className="mb-8">
        <Label htmlFor="search" className="sr-only">Search categories</Label>
        <Input
          id="search"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCategories.map((category) => (
          <Link key={category.id} href={`/categories/${category.id}`}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-neutral-500">{category.bookCount} books</span>
                  <Button variant="ghost" size="md">View</Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      {filteredCategories.length === 0 && (
        <Card className="py-12 text-center">
          <CardContent>
            <h3 className="text-body-lg font-semibold mb-2">No categories found</h3>
            <p className="text-neutral-500 mb-4">Try adjusting your search terms</p>
            <Button onClick={() => setSearchTerm('')}>Clear Search</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}