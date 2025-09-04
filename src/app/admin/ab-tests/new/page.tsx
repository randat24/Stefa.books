'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function NewAbTestPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    variantA: {
      name: '',
      description: '',
    },
    variantB: {
      name: '',
      description: '',
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('variantA.')) {
      const fieldName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        variantA: {
          ...prev.variantA,
          [fieldName]: value
        }
      }));
    } else if (name.startsWith('variantB.')) {
      const fieldName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        variantB: {
          ...prev.variantB,
          [fieldName]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would save this to your backend
    console.log('New A/B test:', formData);
    alert('A/B test created successfully!');
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Create New A/B Test</h1>
          <p className="text-gray-500">Set up a new A/B test experiment</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Link href="/admin/ab-tests">
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Test Information</CardTitle>
            <CardDescription>
              Basic information about your A/B test
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Test Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Homepage CTA Button Test"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what you're testing and why"
                rows={3}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Separator className="my-8" />
        
        <Card>
          <CardHeader>
            <CardTitle>Test Variants</CardTitle>
            <CardDescription>
              Define the two variants for your A/B test
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Variant A (Control)</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="variantA.name">Variant Name</Label>
                  <Input
                    id="variantA.name"
                    name="variantA.name"
                    value={formData.variantA.name}
                    onChange={handleChange}
                    placeholder="e.g., Blue Button"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variantA.description">Description</Label>
                  <Textarea
                    id="variantA.description"
                    name="variantA.description"
                    value={formData.variantA.description}
                    onChange={handleChange}
                    placeholder="Describe the control variant"
                    rows={2}
                    required
                  />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Variant B (Test)</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="variantB.name">Variant Name</Label>
                  <Input
                    id="variantB.name"
                    name="variantB.name"
                    value={formData.variantB.name}
                    onChange={handleChange}
                    placeholder="e.g., Green Button"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variantB.description">Description</Label>
                  <Textarea
                    id="variantB.description"
                    name="variantB.description"
                    value={formData.variantB.description}
                    onChange={handleChange}
                    placeholder="Describe the test variant"
                    rows={2}
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Link href="/admin/ab-tests">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit">Create Test</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}