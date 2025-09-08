'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

// Mock rental history data - in a real app, this would come from your API
const mockRentalHistory = [
  {
    id: '1',
    bookTitle: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    rentedDate: '2023-10-15',
    dueDate: '2023-11-15',
    returnedDate: null,
    status: 'active',
  },
  {
    id: '2',
    bookTitle: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    rentedDate: '2023-09-20',
    dueDate: '2023-10-20',
    returnedDate: '2023-10-18',
    status: 'returned',
  },
  {
    id: '3',
    bookTitle: '1984',
    author: 'George Orwell',
    rentedDate: '2023-08-05',
    dueDate: '2023-09-05',
    returnedDate: '2023-09-03',
    status: 'returned',
  },
  {
    id: '4',
    bookTitle: 'Pride and Prejudice',
    author: 'Jane Austen',
    rentedDate: '2023-07-10',
    dueDate: '2023-08-10',
    returnedDate: '2023-08-12',
    status: 'overdue',
  },
];

export default function RentalHistoryPage() {
  const [rentals] = useState(mockRentalHistory);
  const [filter, setFilter] = useState('all'); // all, active, returned, overdue

  const filteredRentals = rentals.filter(rental => {
    if (filter === 'all') return true;
    return rental.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'returned':
        return <Badge variant="secondary">Returned</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-h1">Rental History</h1>
          <p className="text-gray-500">View your complete rental history</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button 
          variant={filter === 'all' ? 'primary' : 'outline'} 
          onClick={() => setFilter('all')}
        >
          All Rentals
        </Button>
        <Button 
          variant={filter === 'active' ? 'primary' : 'outline'} 
          onClick={() => setFilter('active')}
        >
          Active
        </Button>
        <Button 
          variant={filter === 'returned' ? 'primary' : 'outline'} 
          onClick={() => setFilter('returned')}
        >
          Returned
        </Button>
        <Button 
          variant={filter === 'overdue' ? 'primary' : 'outline'} 
          onClick={() => setFilter('overdue')}
        >
          Overdue
        </Button>
      </div>
      
      {/* Rentals List */}
      <div className="space-y-4">
        {filteredRentals.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">No rental history found</p>
            </CardContent>
          </Card>
        ) : (
          filteredRentals.map((rental) => (
            <Card key={rental.id}>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-h4">{rental.bookTitle}</CardTitle>
                    <CardDescription>by {rental.author}</CardDescription>
                  </div>
                  {getStatusBadge(rental.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-body-sm text-gray-500">Rented Date</p>
                    <p>{new Date(rental.rentedDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-body-sm text-gray-500">Due Date</p>
                    <p>{new Date(rental.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-body-sm text-gray-500">Returned Date</p>
                    <p>
                      {rental.returnedDate 
                        ? new Date(rental.returnedDate).toLocaleDateString()
                        : 'Not returned'}
                    </p>
                  </div>
                  <div>
                    <p className="text-body-sm text-gray-500">Status</p>
                    <p className="capitalize">{rental.status}</p>
                  </div>
                </div>
                
                {rental.status === 'active' && (
                  <>
                    <Separator className="my-4" />
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="md">Extend Rental</Button>
                      <Button size="md">Return Book</Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      <div className="mt-8 text-center">
        <Link href="/rent">
          <Button>Rent More Books</Button>
        </Link>
      </div>
    </div>
  );
}