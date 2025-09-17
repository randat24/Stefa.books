'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export default function AccountSettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false });
  
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showReadingActivity: true });

  const handleNotificationChange = (name: string) => {
    setNotifications(prev => ({
      ...prev,
      [name]: !prev[name as keyof typeof notifications]
    }));
  };

  const handlePrivacyChange = (name: string) => {
    setPrivacy(prev => ({
      ...prev,
      [name]: !prev[name as keyof typeof privacy]
    }));
  };

  return (
    <div className="container py-8">
      <h1 className="text-h1 mb-6">Account Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Update your profile information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" placeholder="Tell us about yourself" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
          
          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-body-sm text-neutral-500">Receive notifications via email</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={() => handleNotificationChange('email')}
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-body-sm text-neutral-500">Receive push notifications on your device</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={() => handleNotificationChange('push')}
                  />
                </div>
                
                {notifications.push && (
                  <div className="mt-4">
                    <p className="text-body-sm text-muted-foreground">Настройки push-уведомлений появятся здесь</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-body-sm text-neutral-500">Receive text messages</p>
                </div>
                <Switch
                  checked={notifications.sms}
                  onCheckedChange={() => handleNotificationChange('sms')}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control who can see your information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Profile Visibility</Label>
                  <p className="text-body-sm text-neutral-500">Allow others to view your profile</p>
                </div>
                <Switch
                  checked={privacy.profileVisible}
                  onCheckedChange={() => handlePrivacyChange('profileVisible')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Reading Activity</Label>
                  <p className="text-body-sm text-neutral-500">Show your reading activity to others</p>
                </div>
                <Switch
                  checked={privacy.showReadingActivity}
                  onCheckedChange={() => handlePrivacyChange('showReadingActivity')}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Danger Zone */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button variant="outline" className="bg-red-500 hover:bg-red-600 text-neutral-0 border-red-500">Delete Account</Button>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Member Since</Label>
                <p>January 15, 2023</p>
              </div>
              
              <div className="space-y-2">
                <Label>Subscription Plan</Label>
                <p>Premium</p>
              </div>
              
              <div className="space-y-2">
                <Label>Books Read</Label>
                <p>24 books</p>
              </div>
              
              <Separator />
              
              <div className="pt-4">
                <Button variant="outline" className="w-full">Change Password</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}