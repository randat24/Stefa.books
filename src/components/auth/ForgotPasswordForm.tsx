"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBackToLogin?: () => void;
  onSuccess?: () => void;
}

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await resetPassword(email);
      
      if (response.success) {
        setIsSubmitted(true);
      } else {
        setError(response.error || 'Failed to send reset email');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Скидання пароля</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          
          <p className="text-gray-600">
            Ми надіслали інструкції зі скидання пароля на вашу електронну пошту.
          </p>
          
          <p className="text-body-sm text-gray-500">
            Якщо ви не отримали листа, перевірте папку &quot;Спам&quot;.
          </p>
        </CardContent>
        
        <CardFooter>
          {onBackToLogin && (
            <Button 
              onClick={onBackToLogin} 
              className="w-full"
              variant="outline"
            >
              Назад до входу
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Скидання пароля</CardTitle>
        <CardDescription>
          Введіть свою електронну пошту, і ми надішлемо вам інструкції зі скидання пароля.
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Електронна пошта</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              placeholder="your@email.com"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Надсилання..." : "Надіслати інструкції"}
          </Button>
          
          {onBackToLogin && (
            <Button 
              type="button" 
              onClick={onBackToLogin} 
              className="w-full"
              variant="outline"
            >
              Назад до входу
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}