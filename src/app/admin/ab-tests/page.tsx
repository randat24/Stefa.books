'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

// Mock A/B test data - in a real app, this would come from your API
const mockAbTests = [
  {
    id: '1',
    name: 'Homepage CTA Button',
    description: 'Testing different colors for the main CTA button on homepage',
    status: 'running',
    startDate: '2023-10-01',
    endDate: '2023-10-31',
    participants: 1243,
    conversions: {
      variantA: { name: 'Blue Button', count: 42, rate: 3.4 },
      variantB: { name: 'Green Button', count: 58, rate: 4.7 },
    },
  },
  {
    id: '2',
    name: 'Book Card Layout',
    description: 'Testing different layouts for book cards in catalog',
    status: 'completed',
    startDate: '2023-09-01',
    endDate: '2023-09-30',
    participants: 2456,
    conversions: {
      variantA: { name: 'Standard Layout', count: 124, rate: 5.0 },
      variantB: { name: 'Compact Layout', count: 156, rate: 6.3 },
    },
  },
  {
    id: '3',
    name: 'Registration Flow',
    description: 'Testing simplified registration form',
    status: 'draft',
    startDate: '',
    endDate: '',
    participants: 0,
    conversions: {
      variantA: { name: 'Standard Form', count: 0, rate: 0 },
      variantB: { name: 'Simplified Form', count: 0, rate: 0 },
    },
  },
];

export default function AbTestsPage() {
  const [tests] = useState(mockAbTests);
  const [filter, setFilter] = useState('all'); // all, running, completed, draft

  const filteredTests = tests.filter(test => {
    if (filter === 'all') return true;
    return test.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge variant="default">Running</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-h1">A/B Tests</h1>
          <p className="text-gray-500">Manage and analyze A/B tests</p>
        </div>
        <Link href="/admin/ab-tests/new">
          <Button>Create New Test</Button>
        </Link>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button 
          variant={filter === 'all' ? 'primary' : 'outline'} 
          onClick={() => setFilter('all')}
        >
          All Tests
        </Button>
        <Button 
          variant={filter === 'running' ? 'primary' : 'outline'} 
          onClick={() => setFilter('running')}
        >
          Running
        </Button>
        <Button 
          variant={filter === 'completed' ? 'primary' : 'outline'} 
          onClick={() => setFilter('completed')}
        >
          Completed
        </Button>
        <Button 
          variant={filter === 'draft' ? 'primary' : 'outline'} 
          onClick={() => setFilter('draft')}
        >
          Draft
        </Button>
      </div>
      
      {/* Tests List */}
      <div className="space-y-6">
        {filteredTests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">No A/B tests found</p>
            </CardContent>
          </Card>
        ) : (
          filteredTests.map((test) => (
            <Card key={test.id}>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-h4">{test.name}</CardTitle>
                    <CardDescription>{test.description}</CardDescription>
                  </div>
                  {getStatusBadge(test.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Test Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Start Date:</span>
                        <span>{test.startDate || 'Not started'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">End Date:</span>
                        <span>{test.endDate || 'Not scheduled'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Participants:</span>
                        <span>{test.participants.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Variants</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>{test.conversions.variantA.name}:</span>
                        <span>{test.conversions.variantA.count} conversions ({test.conversions.variantA.rate}%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{test.conversions.variantB.name}:</span>
                        <span>{test.conversions.variantB.count} conversions ({test.conversions.variantB.rate}%)</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-6">
                  <Link href={`/admin/ab-tests/${test.id}`}>
                    <Button variant="outline" size="md">View Details</Button>
                  </Link>
                  {test.status === 'draft' && (
                    <>
                      <Button variant="outline" size="md">Edit</Button>
                      <Button variant="outline" size="md">Start Test</Button>
                    </>
                  )}
                  {test.status === 'running' && (
                    <Button variant="outline" size="md">Pause Test</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}