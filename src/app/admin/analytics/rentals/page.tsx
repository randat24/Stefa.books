'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

// Mock rental analytics data - in a real app, this would come from your API
const mockRentalAnalytics = {
  totalRentals: 2341,
  activeRentals: 156,
  overdueRentals: 8,
  revenue: 12456.78,
  rentalGrowth: [
    { month: 'Jan', rentals: 180, revenue: 5400 },
    { month: 'Feb', rentals: 195, revenue: 5850 },
    { month: 'Mar', rentals: 210, revenue: 6300 },
    { month: 'Apr', rentals: 225, revenue: 6750 },
    { month: 'May', rentals: 240, revenue: 7200 },
    { month: 'Jun', rentals: 255, revenue: 7650 },
  ],
  popularPlans: [
    { name: 'Basic', rentals: 876, percentage: 37 },
    { name: 'Standard', rentals: 987, percentage: 42 },
    { name: 'Premium', rentals: 478, percentage: 21 },
  ],
};

export default function RentalAnalyticsPage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-h1">Rental Analytics</h1>
          <p className="text-gray-500">Insights into rental trends and revenue</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Link href="/admin/analytics">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
      
      {/* Rental Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body-sm font-medium">Total Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h2">{mockRentalAnalytics.totalRentals.toLocaleString()}</div>
            <p className="text-caption text-muted-foreground">All time rentals</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body-sm font-medium">Active Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h2">{mockRentalAnalytics.activeRentals}</div>
            <p className="text-caption text-muted-foreground">Currently rented books</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body-sm font-medium">Overdue Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h2">{mockRentalAnalytics.overdueRentals}</div>
            <p className="text-caption text-muted-foreground">Books past due date</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h2">${mockRentalAnalytics.revenue.toLocaleString()}</div>
            <p className="text-caption text-muted-foreground">Generated from rentals</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rental Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Rental Growth</CardTitle>
            <CardDescription>
              Monthly rental trends and revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between pt-4 border-b border-l">
              {mockRentalAnalytics.rentalGrowth.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1 px-1">
                  <div className="flex items-end justify-center w-full space-x-1">
                    <div 
                      className="w-1/2 bg-brand-accent rounded-t hover:bg-brand-accent-light transition-colors"
                      style={{ height: `${(data.rentals / 300) * 150}px` }}
                    ></div>
                    <div 
                      className="w-1/2 bg-green-500 rounded-t hover:bg-green-600 transition-colors"
                      style={{ height: `${(data.revenue / 8000) * 150}px` }}
                    ></div>
                  </div>
                  <div className="text-caption mt-2 text-gray-500">{data.month}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-brand-accent rounded mr-2"></div>
                <span className="text-xs">Rentals</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span className="text-xs">Revenue</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Popular Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Subscription Plans</CardTitle>
            <CardDescription>
              Distribution of rental plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRentalAnalytics.popularPlans.map((plan, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{plan.name}</span>
                    <span>{plan.rentals} rentals</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-2xl h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-2xl" 
                      style={{ width: `${plan.percentage}%` }}
                    ></div>
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