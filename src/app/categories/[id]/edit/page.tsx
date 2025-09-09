'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

// Mock category data - in a real app, this would come from your API
const mockCategory = {
  id: '1',
  name: 'Fiction',
  description: 'Novels and fictional works',
  slug: 'fiction',
};

export default function EditCategoryPage() {
  const params = useParams();
  const categoryId = params?.id as string;
  
  // In a real app, you would fetch the category data based on categoryId
  const category = mockCategory;
  
  const [formData, setFormData] = useState({
    name: category.name,
    description: category.description,
    slug: category.slug,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would save this to your backend
    console.log('Updated category:', formData);
    alert('Category updated successfully!');
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-h1">Edit Category</h1>
          <p className="text-neutral-500">Update category information</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Link href={`/categories/${categoryId}`}>
            <Button variant="outline">View Category</Button>
          </Link>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Category Information</CardTitle>
            <CardDescription>
              Update information about the category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Category name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="category-slug"
                required
              />
              <p className="text-body-sm text-neutral-500">Used in URLs. Lowercase letters, numbers, and hyphens only.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Category description"
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Link href="/admin">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit">Update Category</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}