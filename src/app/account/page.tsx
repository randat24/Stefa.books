'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Mock user data - in a real app, this would come from your auth system
const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  joinDate: '2023-01-15',
  subscription: {
    plan: 'Premium',
    endDate: '2024-01-15',
  },
  stats: {
    booksRead: 24,
    booksRented: 8,
    favorites: 12,
  }
};

export default function AccountPage() {
  const [user] = useState(mockUser);
  
  // In a real app, you would fetch user data from your API
  useEffect(() => {
    // Simulate API call
    const fetchUserData = async () => {
      // setUser(actualUserData);
    };
    
    fetchUserData();
  }, []);

  return (
    <div className="container py-8">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">Головна</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">Аккаунт</span>
        </nav>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6">My Account</h1>
          
          {/* Account Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
              <CardDescription>Welcome back, {user.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-500">Books Read</p>
                  <p className="text-2xl font-bold">{user.stats.booksRead}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-500">Currently Rented</p>
                  <p className="text-2xl font-bold">{user.stats.booksRented}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-500">Favorites</p>
                  <p className="text-2xl font-bold">{user.stats.favorites}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Subscription Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Your current subscription details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-semibold">{user.subscription.plan} Plan</h3>
                  <p className="text-sm text-gray-500">Renews on {new Date(user.subscription.endDate).toLocaleDateString()}</p>
                </div>
                <Button variant="outline">Manage Subscription</Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <div className="mr-3 h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Rented &quot;The Great Gatsby&quot;</span>
                  <span className="ml-auto text-sm text-gray-500">2 days ago</span>
                </li>
                <li className="flex items-center">
                  <div className="mr-3 h-2 w-2 rounded-full bg-brand-accent"></div>
                  <span>Added &quot;To Kill a Mockingbird&quot; to favorites</span>
                  <span className="ml-auto text-sm text-gray-500">1 week ago</span>
                </li>
                <li className="flex items-center">
                  <div className="mr-3 h-2 w-2 rounded-full bg-purple-500"></div>
                  <span>Updated profile information</span>
                  <span className="ml-auto text-sm text-gray-500">2 weeks ago</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="w-full md:w-64">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/account/profile" className="block">
                <Button variant="ghost" className="w-full justify-start">
                  Profile Information
                </Button>
              </Link>
              <Link href="/account/orders" className="block">
                <Button variant="ghost" className="w-full justify-start">
                  Rental History
                </Button>
              </Link>
              <Link href="/account/favorites" className="block">
                <Button variant="ghost" className="w-full justify-start">
                  My Favorites
                </Button>
              </Link>
              <Link href="/account/settings" className="block">
                <Button variant="ghost" className="w-full justify-start">
                  Account Settings
                </Button>
              </Link>
              <Separator className="my-2" />
              <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50">
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}