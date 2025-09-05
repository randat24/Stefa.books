'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

// Mock book data - in a real app, this would come from your API
const mockBook = {
  id: '1',
  title: 'The Great Gatsby',
  author: 'F. Scott Fitzgerald',
  isbn: '978-0-7432-7356-5',
  publishedDate: '1925-04-10',
  publisher: 'Charles Scribner\'s Sons',
  category: 'Fiction',
  description: 'A classic American novel set in the summer of 1922, following the story of Jay Gatsby and his obsession with the beautiful Daisy Buchanan.',
  coverImage: '/placeholder-book-cover.jpg',
  price: 2.99,
};

export default function EditBookPage() {
  const params = useParams();
  const bookId = params.id as string;
  
  // In a real app, you would fetch the book data based on bookId
  const book = mockBook;
  
  const [formData, setFormData] = useState({
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    publishedDate: book.publishedDate,
    publisher: book.publisher,
    category: book.category,
    description: book.description,
    coverImage: book.coverImage,
    price: book.price.toString(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would save this to your backend
    console.log('Updated book:', formData);
    alert('Book updated successfully!');
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Book</h1>
          <p className="text-gray-500">Update book information</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Link href={`/books/${bookId}`}>
            <Button variant="outline">View Book</Button>
          </Link>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Book Information</CardTitle>
            <CardDescription>
              Update information about the book
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Book title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="Author name"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleChange}
                  placeholder="ISBN number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="publishedDate">Published Date</Label>
                <Input
                  id="publishedDate"
                  name="publishedDate"
                  type="date"
                  value={formData.publishedDate}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="publisher">Publisher</Label>
                <Input
                  id="publisher"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleChange}
                  placeholder="Publisher name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Book category"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Book description"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image URL</Label>
                <Input
                  id="coverImage"
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Rental Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Link href="/admin">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit">Update Book</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}