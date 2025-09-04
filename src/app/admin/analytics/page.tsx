'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

// Mock analytics data - in a real app, this would come from your API
const mockAnalytics = {
  totalUsers: 1243,
  totalBooks: 567,
  totalRentals: 2341,
  totalRevenue: 12456.78,
  recentActivity: [
    { id: '1', user: 'John Doe', action: 'Rented "The Great Gatsby"', time: '2 minutes ago' },
    { id: '2', user: 'Jane Smith', action: 'Added "1984" to favorites', time: '15 minutes ago' },
    { id: '3', user: 'Robert Johnson', action: 'Subscribed to Premium plan', time: '1 hour ago' },
    { id: '4', user: 'Emily Davis', action: 'Returned "To Kill a Mockingbird"', time: '2 hours ago' },
    { id: '5', user: 'Michael Wilson', action: 'Registered new account', time: '3 hours ago' },
  ],
  topBooks: [
    { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', rentals: 42 },
    { id: '2', title: 'To Kill a Mockingbird', author: 'Harper Lee', rentals: 38 },
    { id: '3', title: '1984', author: 'George Orwell', rentals: 35 },
    { id: '4', title: 'Pride and Prejudice', author: 'Jane Austen', rentals: 31 },
    { id: '5', title: 'The Catcher in the Rye', author: 'J.D. Salinger', rentals: 29 },
  ],
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-500">Overview of platform performance and activity</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button 
            variant={timeRange === '7d' ? 'primary' : 'outline'} 
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </Button>
          <Button 
            variant={timeRange === '30d' ? 'primary' : 'outline'} 
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </Button>
          <Button 
            variant={timeRange === '90d' ? 'primary' : 'outline'} 
            onClick={() => setTimeRange('90d')}
          >
            90 Days
          </Button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.totalBooks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+3% from last period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rentals</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.totalRentals.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+18% from last period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockAnalytics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+24% from last period</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest user actions on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalytics.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <div className="mr-3 mt-1 h-2 w-2 rounded-full bg-green-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.user}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Top Books */}
        <Card>
          <CardHeader>
            <CardTitle>Top Rented Books</CardTitle>
            <CardDescription>
              Most popular books in the last {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalytics.topBooks.map((book, index) => (
                <div key={book.id} className="flex items-center">
                  <div className="mr-4 text-lg font-bold text-muted-foreground w-6">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{book.title}</p>
                    <p className="text-sm text-muted-foreground">{book.author}</p>
                  </div>
                  <div className="text-sm font-medium">
                    {book.rentals} rentals
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Navigation to Detailed Analytics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/analytics/users">
          <Card className="hover:bg-gray-50 cursor-pointer">
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription>Detailed user metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">View Details</Button>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/analytics/books">
          <Card className="hover:bg-gray-50 cursor-pointer">
            <CardHeader>
              <CardTitle>Book Analytics</CardTitle>
              <CardDescription>Book performance and popularity metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">View Details</Button>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/analytics/rentals">
          <Card className="hover:bg-gray-50 cursor-pointer">
            <CardHeader>
              <CardTitle>Rental Analytics</CardTitle>
              <CardDescription>Rental trends and revenue metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">View Details</Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}