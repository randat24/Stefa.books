'use client';

import { useState } from 'react';
// import { useParams } from 'next/navigation'; // Will be used when implementing real API
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

// Mock user data - in a real app, this would come from your API
const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
  status: 'active',
  joinDate: '2023-01-15',
  lastLogin: '2023-10-20',
  bio: 'Book lover and avid reader. I enjoy fiction and historical novels.',
  location: 'New York, NY',
  website: 'https://johndoe.com',
  stats: {
    booksRead: 24,
    booksRented: 8,
    favorites: 12,
  }
};

export default function UserDetailsPage() {
  // const params = useParams(); // Will be used when implementing real API
  // const userId = params.id as string; // Will be used when implementing real API
  
  // In a real app, you would fetch the user data based on userId
  const user = mockUser;
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would save this to your backend
    setIsEditing(false);
  };

  const handleSuspend = () => {
    // In a real app, you would call your API to suspend the user
    alert(`User ${user.name} has been suspended`);
  };

  const handleDelete = () => {
    // In a real app, you would call your API to delete the user
    if (confirm(`Are you sure you want to delete user ${user.name}? This action cannot be undone.`)) {
      alert(`User ${user.name} has been deleted`);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-h1">User Details</h1>
          <p className="text-neutral-500">View and manage user information</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Link href="/admin/users">
            <Button variant="outline">Back to Users</Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>User Information</CardTitle>
                  <CardDescription>
                    Personal details and account information
                  </CardDescription>
                </div>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)}>Edit User</Button>
                )}
              </div>
            </CardHeader>
            
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-body-sm ring-offset-background file:border-0 file:bg-transparent file:text-body-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-body-sm ring-offset-background file:border-0 file:bg-transparent file:text-body-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-body-sm ring-offset-background file:border-0 file:bg-transparent file:text-body-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </CardFooter>
              </form>
            ) : (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <p className="text-neutral-700">{user.name}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <p className="text-neutral-700">{user.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <div>
                      {user.role === 'admin' ? (
                        <Badge variant="default">Admin</Badge>
                      ) : (
                        <Badge variant="secondary">User</Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div>
                      {user.status === 'active' ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Suspended</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <p className="text-neutral-700">{user.bio || 'No bio provided'}</p>
                </div>
              </CardContent>
            )}
          </Card>
          
          {/* Account Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Account Activity</CardTitle>
              <CardDescription>
                User&apos;s account history and activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Join Date</Label>
                  <p className="text-neutral-700">{new Date(user.joinDate).toLocaleDateString()}</p>
                </div>
                <div className="space-y-2">
                  <Label>Last Login</Label>
                  <p className="text-neutral-700">{new Date(user.lastLogin).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          {/* User Stats */}
          <Card>
            <CardHeader>
              <CardTitle>User Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-body-sm text-neutral-500">Books Read</p>
                <p className="text-h2">{user.stats.booksRead}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-body-sm text-neutral-500">Books Rented</p>
                <p className="text-h2">{user.stats.booksRented}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-body-sm text-neutral-500">Favorites</p>
                <p className="text-h2">{user.stats.favorites}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="outline">Send Message</Button>
              <Button className="w-full" variant="outline">Reset Password</Button>
              {user.status === 'active' ? (
                <Button className="w-full" variant="outline" onClick={handleSuspend}>
                  Suspend User
                </Button>
              ) : (
                <Button className="w-full" variant="outline">
                  Activate User
                </Button>
              )}
              <Separator />
              <Button 
                className="w-full border-red-500 text-red-500 hover:bg-red-50 hover:border-red-600" 
                variant="outline" 
                onClick={handleDelete}
              >
                Delete User
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}