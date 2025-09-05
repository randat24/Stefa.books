'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

// Mock user analytics data - in a real app, this would come from your API
const mockUserAnalytics = {
  totalUsers: 1243,
  newUsers: 42,
  activeUsers: 876,
  churnRate: 2.4,
  userGrowth: [
    { month: 'Jan', users: 980 },
    { month: 'Feb', users: 1020 },
    { month: 'Mar', users: 1050 },
    { month: 'Apr', users: 1080 },
    { month: 'May', users: 1120 },
    { month: 'Jun', users: 1150 },
  ],
  topUsers: [
    { id: '1', name: 'John Doe', email: 'john@example.com', booksRead: 42, joinDate: '2023-01-15' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', booksRead: 38, joinDate: '2023-02-20' },
    { id: '3', name: 'Robert Johnson', email: 'robert@example.com', booksRead: 35, joinDate: '2023-03-05' },
    { id: '4', name: 'Emily Davis', email: 'emily@example.com', booksRead: 31, joinDate: '2023-04-12' },
    { id: '5', name: 'Michael Wilson', email: 'michael@example.com', booksRead: 29, joinDate: '2023-05-18' },
  ],
};

export default function UserAnalyticsPage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Analytics</h1>
          <p className="text-gray-500">Detailed insights into user behavior and growth</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Link href="/admin/analytics">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
      
      {/* User Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUserAnalytics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUserAnalytics.newUsers}</div>
            <p className="text-xs text-muted-foreground">In the last 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUserAnalytics.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Users active in last 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUserAnalytics.churnRate}%</div>
            <p className="text-xs text-muted-foreground">Monthly user churn</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>
              Monthly user registration trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between pt-4 border-b border-l">
              {mockUserAnalytics.userGrowth.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1 px-1">
                  <div 
                    className="w-full bg-brand-accent rounded-t hover:bg-brand-accent-light transition-colors"
                    style={{ height: `${(data.users / 1200) * 200}px` }}
                  ></div>
                  <div className="text-xs mt-2 text-gray-500">{data.month}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle>Top Active Users</CardTitle>
            <CardDescription>
              Users with the most book activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockUserAnalytics.topUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-3 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="font-medium text-gray-700">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{user.booksRead} books</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(user.joinDate).toLocaleDateString()}
                    </p>
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