'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function ConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rentalId = searchParams.get('rentalId');
  
  const [countdown, setCountdown] = useState(10);
  
  // Redirect to account orders page after countdown
  useEffect(() => {
    if (countdown <= 0) {
      router.push('/account/orders');
      return;
    }
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-2xl">Rental Confirmed!</CardTitle>
            <CardDescription>
              Your book rental has been successfully processed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Rental Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Rental ID:</span>
                <span className="font-mono">#{rentalId || '12345'}</span>
                
                <span className="text-gray-500">Book:</span>
                <span>&quot;The Great Gatsby&quot; by F. Scott Fitzgerald</span>
                
                <span className="text-gray-500">Rental Period:</span>
                <span>14 days</span>
                
                <span className="text-gray-500">Due Date:</span>
                <span>{new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                
                <span className="text-gray-500">Amount Paid:</span>
                <span>$3.23</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">What&apos;s Next?</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <div className="mr-2 mt-0.5 text-green-600">•</div>
                  <span>Your book will be shipped within 1-2 business days</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-0.5 text-green-600">•</div>
                  <span>You&apos;ll receive a shipping confirmation email with tracking information</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-0.5 text-green-600">•</div>
                  <span>You can track your rental status in your <Link href="/account/orders" className="text-blue-600 hover:underline">account</Link></span>
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
            <p className="text-sm text-gray-500 text-center sm:text-left">
              Redirecting to your account in {countdown} seconds...
            </p>
            <div className="flex gap-2">
              <Link href="/account/orders">
                <Button variant="outline">View Rentals</Button>
              </Link>
              <Link href="/catalog">
                <Button>Browse More Books</Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}