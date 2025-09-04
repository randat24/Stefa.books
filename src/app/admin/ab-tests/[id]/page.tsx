'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

// Mock A/B test data - in a real app, this would come from your API
const mockAbTest = {
  id: '1',
  name: 'Homepage CTA Button',
  description: 'Testing different colors for the main CTA button on homepage',
  status: 'running',
  startDate: '2023-10-01',
  endDate: '2023-10-31',
  participants: 1243,
  conversions: {
    variantA: { 
      name: 'Blue Button', 
      count: 42, 
      rate: 3.4,
      description: 'Standard blue CTA button'
    },
    variantB: { 
      name: 'Green Button', 
      count: 58, 
      rate: 4.7,
      description: 'Alternative green CTA button'
    },
  },
  results: {
    winner: 'variantB',
    significance: 0.95,
    improvement: 38.2,
  }
};

export default function AbTestDetailsPage() {
  // In a real app, you would fetch the test data based on testId from useParams()
  const test = mockAbTest;
  
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{test.name}</h1>
          <p className="text-gray-500">{test.description}</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Link href="/admin/ab-tests">
            <Button variant="outline">Back to Tests</Button>
          </Link>
        </div>
      </div>
      
      {/* Test Status */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-4">
          {getStatusBadge(test.status)}
          <div className="text-sm">
            <span className="text-gray-500">Started:</span> {test.startDate}
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Ends:</span> {test.endDate}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Test Results */}
          {test.status === 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>
                  Statistical analysis of the A/B test
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold text-green-800">
                      {test.conversions.variantB.name} is the winner!
                    </span>
                  </div>
                  <p className="mt-2 text-green-700">
                    {test.results.improvement}% improvement in conversion rate with {test.results.significance * 100}% statistical significance.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{test.conversions.variantA.name}</CardTitle>
                      <CardDescription>Control Variant</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-center">{test.conversions.variantA.rate}%</div>
                      <div className="text-center text-gray-500">Conversion Rate</div>
                      <div className="mt-4 text-center">
                        <div className="text-2xl font-semibold">{test.conversions.variantA.count}</div>
                        <div className="text-gray-500">Conversions</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{test.conversions.variantB.name}</CardTitle>
                      <CardDescription>Test Variant</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-center text-green-600">{test.conversions.variantB.rate}%</div>
                      <div className="text-center text-gray-500">Conversion Rate</div>
                      <div className="mt-4 text-center">
                        <div className="text-2xl font-semibold">{test.conversions.variantB.count}</div>
                        <div className="text-gray-500">Conversions</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Test Details */}
          <Card>
            <CardHeader>
              <CardTitle>Test Details</CardTitle>
              <CardDescription>
                Information about the variants being tested
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">{test.conversions.variantA.name}</h3>
                  <p className="text-gray-600 mb-4">{test.conversions.variantA.description}</p>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="inline-block px-6 py-3 bg-blue-500 text-white rounded">
                        Call to Action
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">{test.conversions.variantB.name}</h3>
                  <p className="text-gray-600 mb-4">{test.conversions.variantB.description}</p>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="inline-block px-6 py-3 bg-green-500 text-white rounded">
                        Call to Action
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          {/* Test Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Test Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-500">Participants</p>
                <p className="text-2xl font-bold">{test.participants.toLocaleString()}</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-500">Total Conversions</p>
                <p className="text-2xl font-bold">{test.conversions.variantA.count + test.conversions.variantB.count}</p>
              </div>
              
              {test.status === 'running' && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-500">Days Remaining</p>
                  <p className="text-2xl font-bold">10</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {test.status === 'draft' && (
                <>
                  <Button className="w-full">Start Test</Button>
                  <Button className="w-full" variant="outline">Edit Test</Button>
                </>
              )}
              
              {test.status === 'running' && (
                <>
                  <Button className="w-full" variant="outline">Pause Test</Button>
                  <Button className="w-full" variant="outline">End Test</Button>
                </>
              )}
              
              {test.status === 'completed' && (
                <>
                  <Button className="w-full" variant="outline">View Raw Data</Button>
                  <Button className="w-full" variant="outline">Export Results</Button>
                </>
              )}
              
              <Button className="w-full bg-red-500 hover:bg-red-600 text-white border-red-500" variant="outline">Delete Test</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}