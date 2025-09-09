'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

// Mock user data - in a real app, this would come from your auth system
const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  joinDate: '2023-01-15',
  bio: 'Book lover and avid reader. I enjoy fiction and historical novels.',
  location: 'New York, NY',
  website: 'https://johndoe.com',
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(mockUser);
  const [formData, setFormData] = useState(mockUser);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would save this to your backend
    setUser(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-h1">Profile</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Manage your personal information and preferences
          </CardDescription>
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
                    disabled
                  />
                  <p className="text-body-sm text-neutral-500">Email cannot be changed</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Member Since</Label>
                <p className="text-neutral-700">{new Date(user.joinDate).toLocaleDateString()}</p>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
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
            
            <div className="space-y-2">
              <Label>Bio</Label>
              <p className="text-neutral-700">{user.bio || 'No bio provided'}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <p className="text-neutral-700">{user.location || 'Not specified'}</p>
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <p className="text-neutral-700">
                  {user.website ? (
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-brand-accent-light hover:underline">
                      {user.website}
                    </a>
                  ) : (
                    'Not specified'
                  )}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Member Since</Label>
              <p className="text-neutral-700">{new Date(user.joinDate).toLocaleDateString()}</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}